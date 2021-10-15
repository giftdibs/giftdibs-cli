const commands = {
  update: '../commands/update',
};

function runCommand(args) {
  const commandName = args[0];

  if (commandName in commands) {
    require(commands[commandName])(args.splice(1));
  }
}

module.exports = function cli(options) {
  runCommand(options.cliArgs);
};
