// priority: 0

// Modify notes' rolling speed here
// if you used a custom tickrate
const ROLLING_SPEED = 6;

const BLACK_KEY_HOLD_MATERIAL = Blocks.AIR.defaultBlockState();

const BLACK_KEY_RELEASE_MATERIAL = Blocks.BLACKSTONE_SLAB.defaultBlockState();

const WHITE_KEY_HOLD_MATERIAL = Blocks.QUARTZ_SLAB.defaultBlockState();

const WHITE_KEY_RELEASE_MATERIAL = Blocks.QUARTZ_BLOCK.defaultBlockState();

function getNoteData(persistentData) {
  const pitch = persistentData.getInt('pitch');
  if (!pitch) return null;

  return {
    pitch: parseInt(pitch),
    velocity: parseInt(persistentData.getInt('velocity') || 127),
  };
}

const RollingDivided = ROLLING_SPEED / 10;

const BlackKeys = [ 1, 3, 6, 8, 10 ];

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

    level.setBlockAndUpdate([ _x, blockY, _z ], material);

    blockCount--;
  }
}

ServerEvents.tick((event) => {
  const pianoInfo = global.piano;
  if (!pianoInfo) return;

  const server = event.getServer();
  const level = server.getLevel('minecraft:overworld'); //
  const notes = level.getEntities().filterSelector('@e[type=minecraft:armor_stand,tag=piano_note]');
  const currentTime = Date.now();

  notes.forEach((note) => {
    const noteData = getNoteData(note.getPersistentData());
    if (!noteData) return;

    const y = note.getY();

    if (y <= pianoInfo.startPos[1] - 2) {
      global.playNote(server, noteData.pitch, noteData.velocity);
      note.kill();

      if (!PressedKeys[noteData.pitch]) {
        let isBlack = isBlackKey(noteData.pitch);
        let material = !isBlack ? WHITE_KEY_HOLD_MATERIAL : BLACK_KEY_HOLD_MATERIAL;
        let blockPos = [ Math.floor(note.getX()), Math.floor(note.getY()), Math.floor(note.getZ()) ];

        fillKeyBlocks(level, blockPos, isBlack, material);

        PressedKeys[noteData.pitch] = {
          pitch: noteData.pitch,
          blockPos: blockPos,
          time: currentTime,
        };
      } else {
        PressedKeys[noteData.pitch].time = currentTime;
      }
    } else {
      note.teleportRelative(0, -RollingDivided, 0);
    }
  });

  for (const pitch of Object.keys(PressedKeys)) {
    let info = PressedKeys[pitch];

    if (currentTime - info.time >= 100) {
      let isBlack = isBlackKey(pitch);
      let material = !isBlack ? WHITE_KEY_RELEASE_MATERIAL : BLACK_KEY_RELEASE_MATERIAL;

      fillKeyBlocks(level, info.blockPos, isBlack, material);

      delete PressedKeys[pitch];
    }
  }
});
