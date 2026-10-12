"""Stage 1: sew the tee on a ghost mannequin with Blender's cloth solver.

blender -b --factory-startup -P scripts/tee3d/sim.py -- 170

Writes draped.blend (the settled garment as a plain mesh, with UVs and
panel materials) and preview.png.
"""
import math
import os
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np

WORK = Path(os.environ["TEE_WORK"])  # see pattern.py: inputs come from here, outputs go here
FRAMES = int(sys.argv[sys.argv.index("--") + 1]) if "--" in sys.argv else 120
P = np.load(WORK / "pattern.npz")
S, TW, TH, CX, TOP = float(P["S"]), float(P["TW"]), float(P["TH"]), float(P["cx"]), float(P["top"])
Z_TOP = 1.47          # where the neck points start, before the garment settles
GAP = 0.14            # front and back panels start this far either side of the body

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
# Earth's pull, but the cloth feels only part of it (effector weights below)
scene.gravity = (0, 0, -9.81)


def to_world(px, py, y):
    return ((px - CX) * S, y, Z_TOP - (py - TOP) * S)


# ------------------------------------------------------------- garment
verts, faces, uvs, mats = [], [], [], []
offset = {}
for panel, y, mat in (("f", -GAP, 0), ("b", GAP, 1)):
    pts, tri = P[panel + "p"], P[panel + "t"]
    offset[panel] = len(verts)
    verts += [to_world(x, z, y) for x, z in pts]
    for t in tri:
        a, b, c = (pts[i] for i in t)
        # front faces must face the camera (-Y), back faces away (+Y)
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])  # in image space, y down
        wind = list(t) if (cross < 0) == (panel == "f") else [t[0], t[2], t[1]]
        faces.append([i + offset[panel] for i in wind])
        mats.append(mat)
        uvs.append([(pts[i][0] / TW if panel == "f" else 1 - pts[i][0] / TW, 1 - pts[i][1] / TH) for i in wind])

pairs = P["pairs"]
sew = [(int(f) + offset["f"], int(b) + offset["b"]) for f, b in pairs]

me = bpy.data.meshes.new("Tee")
me.from_pydata(verts, sew, faces)
me.update()
uv = me.uv_layers.new(name="UVMap")
for poly, quv in zip(me.polygons, uvs):
    for li, (u, v) in zip(poly.loop_indices, quv):
        uv.data[li].uv = (u, v)
for poly, m in zip(me.polygons, mats):
    poly.material_index = m
tee = bpy.data.objects.new("Tee", me)
scene.collection.objects.link(tee)
for name in ("Front", "Back"):
    tee.data.materials.append(bpy.data.materials.new(name))

# check the front faces really face -Y
nf = np.mean([p.normal.y for p in me.polygons if p.material_index == 0])
nb = np.mean([p.normal.y for p in me.polygons if p.material_index == 1])
print(f"mean normal y: front {nf:.2f} (want <0), back {nb:.2f} (want >0)")

# ------------------------------------------------------------- ghost mannequin
# A slim body under an oversized tee: the shoulder seam falls past the
# shoulder, which is what a drop shoulder is.
rings = [  # z, half-width x, half-depth y: about 0.80 m round, so the 1.05 m shirt hangs with ease
    (0.62, 0.145, 0.104), (0.80, 0.147, 0.106), (0.98, 0.140, 0.100), (1.15, 0.146, 0.104),
    (1.27, 0.152, 0.104), (1.35, 0.178, 0.100), (1.41, 0.150, 0.090), (1.45, 0.085, 0.070),
    (1.47, 0.062, 0.058), (1.62, 0.056, 0.056),
]
bm = bmesh.new()
n = 48
prev = None
for z, rx, ry in rings:
    ring = []
    for k in range(n):
        a = 2 * math.pi * k / n
        c, s = math.cos(a), math.sin(a)
        e = 2.2  # superellipse: a boxier chest and back than an ellipse
        x = rx * math.copysign(abs(c) ** (2 / e), c)
        y = ry * math.copysign(abs(s) ** (2 / e), s)
        ring.append(bm.verts.new((x, y, z)))
    if prev:
        for k in range(n):
            bm.faces.new((prev[k], prev[(k + 1) % n], ring[(k + 1) % n], ring[k]))
    prev = ring
bm.faces.new(prev)
body_me = bpy.data.meshes.new("Body")
bm.to_mesh(body_me)
body = bpy.data.objects.new("Body", body_me)
scene.collection.objects.link(body)

# arms along the sleeves' own angle on the pattern (about 31 degrees down)
ang = math.radians(31)
for side in (-1, 1):
    # tapered to fill the sleeve (about 0.42 m round at the shoulder, 0.35 m at the cuff), so it hangs smooth
    bpy.ops.mesh.primitive_cone_add(radius1=0.060, radius2=0.050, depth=0.36, vertices=40)
    arm = bpy.context.active_object
    arm.name = f"Arm{'L' if side < 0 else 'R'}"
    sx, sz = 0.19 * side, 1.33
    dx, dz = math.cos(ang) * side, -math.sin(ang)
    arm.location = (sx + dx * 0.18, 0, sz + dz * 0.18)
    # a cone's wide end is at local -Z: point local +Z outward along the sleeve
    arm.rotation_euler = (0, (math.pi / 2 + ang) if side > 0 else -(math.pi / 2 + ang), 0)

colliders = [o for o in scene.objects if o.name != "Tee"]
for o in colliders:
    o.modifiers.new("Collision", "COLLISION")
    o.collision.thickness_outer = 0.006
    # arms grip, so sleeves do not slide down the slope and bunch at the cuff
    o.collision.cloth_friction = 15.0 if o.name.startswith("Arm") else 3.0
    o.hide_render = True

# ------------------------------------------------------------- cloth
cloth = tee.modifiers.new("Cloth", "CLOTH")
cs = cloth.settings
cs.quality = 12
cs.mass = 0.3                       # Blender's mass is per point; stability wants the default
cs.air_damping = 1.0
cs.tension_stiffness = 80
cs.compression_stiffness = 80
cs.shear_stiffness = 40
cs.bending_stiffness = 5.0          # 230 GSM folds in broad soft creases, not crinkles
cs.tension_damping = 8
cs.compression_damping = 8
cs.shear_damping = 8
cs.bending_damping = 1.0
cs.use_sewing_springs = True
cs.sewing_force_max = 30
cc = cloth.collision_settings
cc.collision_quality = 4
cc.distance_min = 0.005
cc.use_self_collision = True
cc.self_distance_min = 0.004
cc.self_friction = 5
# Sew first, then let it hang: no gravity while the seams close round the
# body, so the shirt cannot slide off the shoulders before it is a shirt.
ew = cs.effector_weights
ew.gravity = 0.0
ew.keyframe_insert("gravity", frame=70)
ew.gravity = 0.55
ew.keyframe_insert("gravity", frame=95)
cloth.point_cache.frame_start = 1
cloth.point_cache.frame_end = FRAMES

scene.frame_start, scene.frame_end = 1, FRAMES
hem_f = [int(i) + offset["f"] for i in np.where(P["fl"] == "hem")[0]]
neck_f = [int(i) + offset["f"] for i in np.where(P["fl"] == "neck")[0]]
side_f = [int(i) + offset["f"] for i in np.where(P["fl"] == "sideL")[0]]
for f in range(1, FRAMES + 1):
    scene.frame_set(f)
    if f % 10 == 0:
        dgf = bpy.context.evaluated_depsgraph_get()
        mm = tee.evaluated_get(dgf).to_mesh()
        co = np.array([v.co[:] for v in mm.vertices])
        tee.evaluated_get(dgf).to_mesh_clear()
        print(f"frame {f}: hem z {co[hem_f,2].mean():.3f} neck z {co[neck_f,2].mean():.3f} front y {co[:offset['b'],1].mean():.3f} sideL y {co[side_f,1].mean():.3f} sideL x {co[side_f,0].mean():.3f}", flush=True)

# ------------------------------------------------------------- freeze it
dg = bpy.context.evaluated_depsgraph_get()
ev = tee.evaluated_get(dg)
draped = bpy.data.meshes.new_from_object(ev)
out = bpy.data.objects.new("Draped", draped)
scene.collection.objects.link(out)
for m in tee.data.materials:
    out.data.materials.append(m)
tee.hide_render = True
tee.hide_viewport = True
co = np.array([v.co[:] for v in draped.vertices])
print("draped bounds", co.min(0).round(3), co.max(0).round(3))
for poly in draped.polygons:
    poly.use_smooth = True
np.save(WORK / "draped_co.npy", co)

# quick look: flat materials so the shape reads
fm, bmat = bpy.data.materials["Front"], bpy.data.materials["Back"]
for mat, img in ((fm, "front.jpg"), (bmat, "back.jpg")):
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(str(WORK / img))
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.85

cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 70
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
cam.location = (0.0, -2.35, 1.12)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
for name, loc, power, size in (("Key", (-1.6, -1.8, 2.4), 300, 1.2), ("Fill", (1.8, -1.6, 1.3), 110, 1.5), ("Rim", (0.5, 1.6, 2.2), 350, 0.8)):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy, ld.size = power, size
    lo = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(lo)
    lo.location = loc
    # aim: Blender lights point down -Z; use a track-to constraint
    tr = lo.constraints.new("TRACK_TO")
    tr.target = out
    tr.track_axis = "TRACK_NEGATIVE_Z"
    tr.up_axis = "UP_Y"
world = bpy.data.worlds.new("W")
world.color = (0.18, 0.22, 0.28)
scene.world = world
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = scene.render.resolution_y = 720
scene.render.filepath = str(WORK / "preview.png")
bpy.ops.render.render(write_still=True)

bpy.ops.wm.save_as_mainfile(filepath=str(WORK / "draped.blend"))
print("done")
