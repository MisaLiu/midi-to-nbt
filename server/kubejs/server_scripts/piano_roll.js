// priority: 0

// Modify notes' rolling speed here
// if you used a custom tickrate
const ROLLING_SPEED = 6;

// Modify piano's Y position
const PIANO_Y = -61;

function getArmorStandData(persistentData) {
  const pitch = persistentData.getInt('pitch');
  if (!pitch) return null;

  return {
    pitch: parseInt(pitch),
    velocity: parseInt(persistentData.getInt('velocity') || 127),
  };
}

const RollingDivided = ROLLING_SPEED / 10;

ServerEvents.tick((event) => {
  const server = event.getServer();
  const level = server.getLevel('minecraft:overworld'); //
  const notes = level.getEntities().filterSelector('@e[type=minecraft:armor_stand,tag=piano_note]');

  notes.forEach((note) => {
    const noteData = getArmorStandData(note.getPersistentData());
    if (!noteData) return;

    const y = note.getY();

    if (y <= PIANO_Y - 2) {
      global.playNote(server, noteData.pitch, noteData.velocity);
      note.kill();
    } else {
      note.teleportRelative(0, -RollingDivided, 0);
    }
  });
});
