import { Uri } from "vscode";
import { reportError } from "../../helper";
import Command from "./command";

interface BaseCommandOption {
  id: string;
  name?: string;
}

interface CommandOption extends BaseCommandOption {
  handleCommand: (this: Command, ...args: any[]) => unknown | Promise<unknown>;
}

interface FileCommandOption extends BaseCommandOption {
  handleFile: () => Promise<unknown>;
  getFileTarget: (
    ...args: any[]
  ) => undefined | Uri | Uri[] | Promise<undefined | Uri | Uri[]>;
}

function checkType<T>() {
  return (a: T) => a;
}

export const checkCommand = checkType<CommandOption>();
export const checkFileCommand = checkType<FileCommandOption>();

export function createCommand(commandOption: CommandOption & { name: string }) {
  return class NormalCommand extends Command {
    constructor() {
      super();
      this.id = commandOption.id;
      this.name = commandOption.name;
    }

    doCommandRun(...args) {
      commandOption.handleCommand.apply(this, args);
    }
  };
}

export function createFileCommand(
  commandOption: FileCommandOption & { name: string }
) {
  return class FileCommand extends Command {
    constructor() {
      super();
      this.id = commandOption.id;
      this.name = commandOption.name;
    }

    protected async doCommandRun(...args) {
      try {
        await commandOption.handleFile();
      } catch (error) {
        reportError(error);
      }
    }
  };
}
