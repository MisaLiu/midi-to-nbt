// priority: 0

// Modify notes' rolling speed here
// if you used a custom tickrate
const ROLLING_SPEED = 6;

const BLACK_KEY_HOLD_MATERIAL = Blocks.AIR.defaultBlockState();

const BLACK_KEY_RELEASE_MATERIAL = Blocks.POLISHED_BLACKSTONE_SLAB.defaultBlockState();

const WHITE_KEY_HOLD_MATERIAL = Blocks.QUARTZ_SLAB.defaultBlockState();

const WHITE_KEY_RELEASE_MATERIAL = Blocks.QUARTZ_BLOCK.defaultBlockState();

const KEY_EDGE_HOLD_MATERIAL = Blocks.PEARLESCENT_FROGLIGHT.defaultBlockState();

const KEY_EDGE_RELEASE_MATERIAL = Blocks.AMETHYST_BLOCK.defaultBlockState();

function getNoteData(persistentData) {
  const pitch = persistentData.getInt('pitch');
  if (!pitch) return null;

  return {
    pitch: parseInt(pitch),
    velocity: parseInt(persistentData.getInt('velocity') || 127),
    distance: parseFloat(persistentData.getFloat('distance') || 0),
    duration: parseInt(persistentData.getInt('duration') || 5),
    activated: persistentData.getInt('activated') === 1,
    remaining: parseInt(persistentData.getInt('remaining') || 0),
  };
}

global.RollingDivided = ROLLING_SPEED / 10;

const BlackKeys = [ 1, 3, 6, 8, 10 ];

// pitch -> { blockPos, count } — count tracks how many active note entities hold this key down
const PressedKeys = {};

function isBlackKey(pitch) {
  const keyId = ((pitch - 21) + 9) % 12;
  return BlackKeys.indexOf(keyId) !== -1;
}

function fillKeyBlocks(level, notePos, isBlackKey, material) {
  const facing = global.piano?.facing;
  if (!facing) return;

  const blockY = Math.floor(notePos[1] + 3 + (!isBlackKey ? -1 : 0));

  let blockCount = isBlackKey ? 3 : 5;
  while (blockCount > 0) {
    let _x = notePos[0];
    let _z = notePos[2];

    if (facing === 'north') _z += blockCount;
    if (facing === 'south') _z -= blockCount;
    if (facing === 'east') _x -= blockCount;
    if (facing === 'west') _x += blockCount;

    level.setBlock([ _x, blockY, _z ], material, 2, 0);

    blockCount--;
  }
}

ServerEvents.tick((event) => {
  const pianoInfo = global.piano;
  if (!pianoInfo || !global.piano.isSet || !pianoInfo.facing) return;

  const server = event.getServer();
  const level = server.getLevel(pianoInfo.dimension);
  const notes = level.getEntities().filterSelector('@e[type=minecraft:block_display,tag=piano_note]');

  notes.forEach((note) => {
    const noteData = getNoteData(note.getPersistentData());
    if (!noteData) return;

    if (noteData.activated) {
      const remaining = noteData.remaining - 1;

      if (remaining <= 0) {
        const entry = PressedKeys[noteData.pitch];
        if (entry) {
          entry.count--;

          if (entry.count <= 0) {
            let isBlack = isBlackKey(noteData.pitch);
            let material = !isBlack ? WHITE_KEY_RELEASE_MATERIAL : BLACK_KEY_RELEASE_MATERIAL;

            fillKeyBlocks(level, entry.blockPos, isBlack, material);
            level.setBlock([ entry.blockPos[0], entry.blockPos[1] + 3, entry.blockPos[2] ], KEY_EDGE_RELEASE_MATERIAL, 2, 0);
            delete PressedKeys[noteData.pitch];
          }
        }

        note.kill();
      } else {
        note.persistentData.putInt('remaining', remaining);
      }
    } else if (noteData.distance >= global.piano.height) {
      global.playNote(server, noteData.pitch, noteData.velocity);

      let isBlack = isBlackKey(noteData.pitch);
      let blockPos = [ Math.floor(note.getX()), pianoInfo.startPos[1] - 3, Math.floor(note.getZ()) ];

      if (!PressedKeys[noteData.pitch]) {
        let material = !isBlack ? WHITE_KEY_HOLD_MATERIAL : BLACK_KEY_HOLD_MATERIAL;

        fillKeyBlocks(level, blockPos, isBlack, material);
        level.setBlock([ blockPos[0], blockPos[1] + 3, blockPos[2] ], KEY_EDGE_HOLD_MATERIAL, 2, 0);

        PressedKeys[noteData.pitch] = { blockPos: blockPos, count: 1 };
      } else {
        // Same pitch already held — just increment the active-note counter
        PressedKeys[noteData.pitch].count++;
      }

      note.persistentData.putInt('activated', 1);
      note.persistentData.putInt('remaining', noteData.duration);
    } else {
      // note.teleportRelative(0, -RollingDivided, 0);
      if (noteData.distance === 0) {
        // initalize interpolation
        note.mergeNbt({
          transformation: {
            translation: [ 0, -global.piano.height - global.RollingDivided * noteData.duration, 0 ],
            scale: [ 1, noteData.duration * global.RollingDivided, 1 ],
            left_rotation: [ 0, 0, 0, 1 ],
            right_rotation: [ 0, 0, 0, 1 ],
          },
          start_interpolation: -1,
          interpolation_duration: global.piano.height / global.RollingDivided + noteData.duration,
        });
      }

      note.persistentData.putFloat('distance', noteData.distance + global.RollingDivided);
    }
  });
});
