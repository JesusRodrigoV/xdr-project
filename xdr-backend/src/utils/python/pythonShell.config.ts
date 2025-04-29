import PythonShell from "python-shell";
import { config } from "../../../config";

export const getPythonShellOptions = (
  scriptName: string,
): PythonShell.Options => ({
  mode: "text",
  pythonPath: config.python.path,
  pythonOptions: ["-u"],
  encoding: "utf8",
});
