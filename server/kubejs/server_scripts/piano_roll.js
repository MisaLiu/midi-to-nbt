// priority: 0

// Modify notes' rolling speed here
// if you used a custom tickrate
const ROLLING_SPEED = 6;

// Modify piano's Y position
const PIANO_Y = -61;

const VelocityMap = [
  'ppp',
  'pp',
  'p',
  'mp',
  'mf',
  'f',
  'ff',
  'fff'
];

function getArmorStandData(persistentData) {
  const pitch = persistentData.getInt('pitch');
  if (!pitch) return null;

  const velocity = (
    parseInt(persistentData.getInt('velocity') || 127) / 127
  ).toFixed(2);
  const velocityCodeIndex = Math.round(velocity * (VelocityMap.length - 1));

  return {
    pitch: parseInt(pitch),
    velocity: VelocityMap[velocityCodeIndex],
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
      server.runCommandSilent(`execute as @a at @s run playsound minecraft:lkrb.piano.p${noteData.pitch}${noteData.velocity} master @s ~ ~ ~ 1 1`);
      note.kill();
    } else {
      note.setPos(note.getX(), y - RollingDivided, note.getZ());
    }
  });
});
