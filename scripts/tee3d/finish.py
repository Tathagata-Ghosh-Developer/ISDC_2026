"""Stage 2: finish the draped tee, rig it, animate it, light it, export it.

blender -b "$TEE_WORK/draped.blend" -P scripts/tee3d/finish.py -- <mode>
  mode: stills   render a few check frames
        render   render the 360-frame loop to frames/
        export   write tee.glb only
Always saves finished.blend.
"""
import math
import os
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector

HERE = Path(__file__).parent
MODE = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "stills"
WORK = Path(os.environ["TEE_WORK"])  # see pattern.py: inputs come from here, outputs go here
P = np.load(WORK / "pattern.npz")
FPS, LOOP = 60, 360           # six seconds, sixty frames a second
SHIRT = (2 / 255, 57 / 255, 87 / 255)

scene = bpy.context.scene
for o in list(scene.objects):
    if o.name != "Draped":
        bpy.data.objects.remove(o, do_unlink=True)
src = bpy.data.objects["Draped"]

# ------------------------------------------------------------- clean the cloth
bm = bmesh.new()
bm.from_mesh(src.data)
bm.verts.ensure_lookup_table()
nf = len(P["fp"])
# drop the sewing threads, then weld each seam pair at its midpoint
bmesh.ops.delete(bm, geom=[e for e in bm.edges if not e.link_faces], context="EDGES")
bm.verts.ensure_lookup_table()
target = {}
for f, b in P["pairs"]:
    vf, vb = bm.verts[int(f)], bm.verts[int(b) + nf]
    mid = (vf.co + vb.co) / 2
    vf.co = mid
    vb.co = mid
    target[vb] = vf
bmesh.ops.weld_verts(bm, targetmap=target)
# take out the solver's fine jitter without losing the drape, and settle
# the crumple the cuffs pick up on the arms
for _ in range(2):
    bmesh.ops.smooth_vert(bm, verts=[v for v in bm.verts if not v.is_boundary], factor=0.35,
                          use_axis_x=True, use_axis_y=True, use_axis_z=True)
sleeve_verts = [v for v in bm.verts if abs(v.co.x) > 0.22 and v.co.z > 1.05]
for _ in range(8):
    bmesh.ops.smooth_vert(bm, verts=sleeve_verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)

# face the camera square-on: turn the whole shirt so the front panel's mean normal points at -Y
bm.normal_update()
n = Vector((0, 0, 0))
for f in bm.faces:
    if f.material_index == 0:
        n += f.normal * f.calc_area()
yaw = math.atan2(n.x, -n.y)
cen = sum((v.co for v in bm.verts), Vector()) / len(bm.verts)
R = Matrix.Rotation(-yaw, 4, "Z")
for v in bm.verts:
    v.co = R @ (v.co - Vector((cen.x, cen.y, 0))) + Vector((0, 0, 0))
print(f"turned by {math.degrees(-yaw):.1f} degrees to face the camera")

# ------------------------------------------------------------- a ribbed crew neck
uv = bm.loops.layers.uv.active
boundary = [e for e in bm.edges if e.is_boundary]
loops = []
seen = set()
for e in boundary:
    if e in seen:
        continue
    loop, stack = [], [e]
    while stack:
        cur = stack.pop()
        if cur in seen:
            continue
        seen.add(cur)
        loop.append(cur)
        for v in cur.verts:
            stack += [x for x in v.link_edges if x.is_boundary and x not in seen]
    loops.append(loop)
neck = max(loops, key=lambda L: sum(v.co.z for e in L for v in e.verts) / (2 * len(L)))
ncen = sum((v.co for e in neck for v in e.verts), Vector()) / (2 * len(neck))
ret = bmesh.ops.extrude_edge_only(bm, edges=neck)
new_verts = [g for g in ret["geom"] if isinstance(g, bmesh.types.BMVert)]
new_faces = set()
for v in new_verts:
    inward = Vector((ncen.x - v.co.x, ncen.y - v.co.y, 0))
    v.co += inward * 0.20 + Vector((0, 0, 0.011))   # a crew rib lies along the neckline, it does not stand up
    new_faces.update(v.link_faces)
for f in new_faces:
    f.material_index = 2
    for lp in f.loops:
        d = lp.vert.co - ncen
        lp[uv].uv = ((math.atan2(d.y, d.x) / (2 * math.pi) + 0.5) * 6, 1.0 if lp.vert in new_verts else 0.0)
bm.normal_update()

me = bpy.data.meshes.new("TeeBase")
bm.to_mesh(me)
bm.free()
for poly in me.polygons:
    poly.use_smooth = True
base = bpy.data.objects.new("TeeBase", me)
scene.collection.objects.link(base)
bpy.data.objects.remove(src, do_unlink=True)

# ------------------------------------------------------------- materials
def image(path, colour=True):
    img = bpy.data.images.load(str(path), check_existing=True)
    if not colour:
        img.colorspace_settings.name = "Non-Color"
    return img


def fabric(name, base, normal_img, scale):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.92
    b.inputs["Sheen Weight"].default_value = 0.15
    b.inputs["Sheen Roughness"].default_value = 0.55
    b.inputs["Specular IOR Level"].default_value = 0.25
    if isinstance(base, tuple):
        b.inputs["Base Color"].default_value = (*[c ** 2.2 for c in base], 1)
    else:
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = image(base)
        nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, 1)
    nimg = nt.nodes.new("ShaderNodeTexImage")
    nimg.image = image(normal_img, colour=False)
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 0.3
    nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], nimg.inputs["Vector"])
    nt.links.new(nimg.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return mat


knit = WORK / "fabric-normal.png"
rib = HERE / "rib-normal.png"
m_front = fabric("Front", WORK / "front.jpg", knit, 60)
m_back = fabric("Back", WORK / "back.jpg", knit, 60)
m_rib = fabric("Rib", SHIRT, rib, 1)
m_inner = fabric("Inner", tuple(c * 0.75 for c in SHIRT), knit, 60)
for m in (m_front, m_back, m_rib, m_inner, m_inner, m_rib):
    base.data.materials.append(m)

# ------------------------------------------------------------- weights for the float
co = np.array([v.co[:] for v in base.data.vertices])
zmin, zmax = co[:, 2].min(), co[:, 2].max()
ss = lambda e0, e1, x: np.clip((x - e0) / (e1 - e0), 0, 1) ** 2 * (3 - 2 * np.clip((x - e0) / (e1 - e0), 0, 1))
ang = math.radians(31)
weights = {}
for side, name in ((-1, "sleeve.L"), (1, "sleeve.R")):
    J = np.array([0.19 * side, 0, 1.33])
    a = np.array([math.cos(ang) * side, 0, -math.sin(ang)])
    rel = co - J
    t = rel @ a
    d = np.linalg.norm(rel - np.outer(t, a), axis=1)
    weights[name] = ss(0.02, 0.13, t) * (1 - ss(0.11, 0.17, d)) * (co[:, 0] * side > 0.10)
hem_top, hem_bot = zmin + 0.34, zmin
weights["hem"] = 0.85 * ss(hem_top, hem_bot, co[:, 2]) * (1 - np.maximum(weights["sleeve.L"], weights["sleeve.R"]))
weights["body"] = np.clip(1 - weights["sleeve.L"] - weights["sleeve.R"] - weights["hem"], 0, 1)
for name, w in weights.items():
    g = base.vertex_groups.new(name=name)
    for i, x in enumerate(w):
        if x > 1e-3:
            g.add([i], float(x), "REPLACE")

# ------------------------------------------------------------- rig
mid_z = (zmin + zmax) / 2
float_empty = bpy.data.objects.new("Float", None)
scene.collection.objects.link(float_empty)
float_empty.location = (0, 0, mid_z)
arm_data = bpy.data.armatures.new("Rig")
rig = bpy.data.objects.new("Rig", arm_data)
scene.collection.objects.link(rig)
rig.parent = float_empty
rig.location = (0, 0, -mid_z)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="EDIT")
eb = arm_data.edit_bones.new("body")
eb.head, eb.tail = (0, 0, zmin + 0.2), (0, 0, zmax - 0.05)
for side, name in ((-1, "sleeve.L"), (1, "sleeve.R")):
    b = arm_data.edit_bones.new(name)
    b.head = (0.19 * side, 0, 1.33)
    b.tail = (0.19 * side + math.cos(ang) * side * 0.25, 0, 1.33 - math.sin(ang) * 0.25)
    b.parent = eb
hb = arm_data.edit_bones.new("hem")
hb.head, hb.tail = (0, 0, hem_top), (0, 0, hem_bot)
hb.parent = eb
bpy.ops.object.mode_set(mode="OBJECT")


def finish_mesh(name, subdiv):
    ob = base.copy()
    ob.data = base.data.copy()
    ob.name = name
    scene.collection.objects.link(ob)
    if subdiv:
        sd = ob.modifiers.new("Subdiv", "SUBSURF")
        sd.levels = sd.render_levels = subdiv
    so = ob.modifiers.new("Solidify", "SOLIDIFY")
    so.thickness = 0.0028
    so.offset = -1
    so.use_rim = True
    so.material_offset = 3
    so.material_offset_rim = 3
    bpy.context.view_layer.objects.active = ob
    for m in list(ob.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    ob.parent = rig
    am = ob.modifiers.new("Armature", "ARMATURE")
    am.object = rig
    return ob


hi = finish_mesh("Tee", 1)
web = finish_mesh("TeeWeb", 0)
base.hide_render = base.hide_viewport = True
print("faces: render", len(hi.data.polygons), "web", len(web.data.polygons))

# ------------------------------------------------------------- the loop
def bone_rot(pb, world_rot):
    """A rotation given in armature space about the bone's head, as the bone's own basis."""
    M = pb.bone.matrix_local
    basis = M.inverted() @ world_rot.to_matrix().to_4x4() @ M
    return basis.to_quaternion()


scene.render.fps = FPS
scene.frame_start, scene.frame_end = 1, LOOP
up = Vector((0, 0, 1))
for f in range(1, LOOP + 2):
    ph = 2 * math.pi * (f - 1) / LOOP
    # a slow sway of 17 degrees each way, a breath of tilt, and a hover twice per loop
    float_empty.rotation_euler = (math.radians(1.6) * math.sin(ph + math.pi / 3), 0, math.radians(17) * math.sin(ph))
    float_empty.location = (0, 0, mid_z + 0.011 * math.sin(2 * ph))
    float_empty.keyframe_insert("rotation_euler", frame=f)
    float_empty.keyframe_insert("location", frame=f)
    # the loose parts trail the body by a quarter turn, as if the air were thick
    lag = -math.cos(ph)
    for side, name in ((-1, "sleeve.L"), (1, "sleeve.R")):
        pb = rig.pose.bones[name]
        pb.rotation_mode = "QUATERNION"
        flap = Quaternion(Vector((0, 1, 0)), math.radians(3.5) * side * math.sin(2 * ph - (0.9 if side < 0 else 0.5)))
        trail = Quaternion(up, math.radians(7) * lag)
        pb.rotation_quaternion = bone_rot(pb, trail @ flap)
        pb.keyframe_insert("rotation_quaternion", frame=f)
    pb = rig.pose.bones["hem"]
    pb.rotation_mode = "QUATERNION"
    twist = Quaternion(up, math.radians(5) * lag)
    swing = Quaternion(Vector((1, 0, 0)), math.radians(2.2) * math.sin(2 * ph - 1.2))
    pb.rotation_quaternion = bone_rot(pb, twist @ swing)
    pb.keyframe_insert("rotation_quaternion", frame=f)

for o in (float_empty, rig):
    ad = o.animation_data
    if ad and ad.action:
        try:
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = "LINEAR"
        except AttributeError:
            pass

# ------------------------------------------------------------- the studio
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 85
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = 2.8
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
cam.location = (0, -2.55, mid_z + 0.01)
cam.rotation_euler = (math.radians(90), 0, 0)
focus = bpy.data.objects.new("Focus", None)
scene.collection.objects.link(focus)
focus.location = (0, -0.13, mid_z + 0.08)
cam_data.dof.focus_object = focus
scene.camera = cam

# the kash photograph, far behind, so the lens softens it
bg_img = image(WORK / "bg-kash-square.jpg")
bpy.ops.mesh.primitive_plane_add(size=2.9, location=(0, 2.6, mid_z))
bg = bpy.context.active_object
bg.name = "Backdrop"
bg.rotation_euler = (math.radians(90), 0, 0)
bm_ = bpy.data.materials.new("Backdrop")
bm_.use_nodes = True
nt = bm_.node_tree
for nd in list(nt.nodes):
    if nd.type != "OUTPUT_MATERIAL":
        nt.nodes.remove(nd)
em = nt.nodes.new("ShaderNodeEmission")
tx = nt.nodes.new("ShaderNodeTexImage")
tx.image = bg_img
nt.links.new(tx.outputs["Color"], em.inputs["Color"])
em.inputs["Strength"].default_value = 1.0
nt.links.new(em.outputs["Emission"], nt.nodes["Material Output"].inputs["Surface"])
bg.data.materials.append(bm_)
bg.visible_shadow = False

# three-point light: key from the top left, fill from the right, rim from behind
def area(name, loc, power, size, colour):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy, ld.size, ld.color = power, size, colour
    lo = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(lo)
    lo.location = loc
    tr = lo.constraints.new("TRACK_TO")
    tr.target = focus
    tr.track_axis, tr.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"
    return lo


area("Key", (-1.5, -1.7, mid_z + 1.25), 190, 1.6, (1.0, 0.96, 0.9))
area("Fill", (1.7, -1.4, mid_z + 0.15), 55, 2.2, (0.95, 0.97, 1.0))
area("Rim", (0.35, 1.3, mid_z + 1.0), 280, 1.1, (0.92, 0.96, 1.0))
world = bpy.data.worlds.new("Studio")
world.color = (0.07, 0.09, 0.12)
scene.world = world

scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = "Standard"
ee = scene.eevee
for attr, val in (("taa_render_samples", 64), ("use_raytracing", True), ("use_shadows", True),
                  ("shadow_ray_count", 2), ("shadow_step_count", 8), ("use_fast_gi", True)):
    if hasattr(ee, attr):
        try:
            setattr(ee, attr, val)
        except Exception as ex:
            print("eevee", attr, ex)
scene.render.image_settings.file_format = "PNG"

bpy.ops.wm.save_as_mainfile(filepath=str(WORK / "finished.blend"))

if MODE == "stills":
    for f in (1, 91, 181, 271):
        scene.frame_set(f)
        scene.render.filepath = str(WORK / f"still-{f:03d}.png")
        bpy.ops.render.render(write_still=True)
elif MODE == "render":
    (WORK / "frames").mkdir(exist_ok=True)
    scene.render.filepath = str(WORK / "frames" / "f")
    bpy.ops.render.render(animation=True)
if MODE in ("export", "render", "stills"):
    scene.frame_end = LOOP + 1          # the clip ends on the pose it began with, so it loops clean
    bpy.ops.object.select_all(action="DESELECT")
    for o in (float_empty, rig, web):
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(WORK / "tee.glb"), export_format="GLB", use_selection=True,
        export_animations=True, export_skins=True, export_apply=False,
        export_materials="EXPORT", export_image_format="AUTO", export_yup=True,
    )
    scene.frame_end = LOOP
print("done", MODE)
