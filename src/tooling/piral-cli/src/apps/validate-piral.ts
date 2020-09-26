import { retrievePiralRoot, retrievePiletsInfo, ruleSummary, runRules, config } from '../common';
import { setLogLevel, progress, log, checkCliCompatibility } from '../common';
import { getPiralRules } from '../rules';
import { LogLevels, PiralRuleContext } from '../types';

export interface ValidatPiralOptions {
  entry?: string;
  logLevel?: LogLevels;
}

export const validatePiralDefaults: ValidatPiralOptions = {
  entry: './',
  logLevel: LogLevels.info,
};

export async function validatePiral(baseDir = process.cwd(), options: ValidatPiralOptions = {}) {
  const { entry = validatePiralDefaults.entry, logLevel = validatePiralDefaults.logLevel } = options;
  setLogLevel(logLevel);
  progress('Reading configuration ...');

  const rules = await getPiralRules();
  const entryFiles = await retrievePiralRoot(baseDir, entry);
  const { root, dependencies, ignored: _, ...info } = await retrievePiletsInfo(entryFiles);
  const errors: Array<string> = [];
  const warnings: Array<string> = [];

  await checkCliCompatibility(root);

  const context: PiralRuleContext = {
    error(message) {
      errors.push(log('generalError_0002', message));
    },
    warning(message) {
      warnings.push(log('generalWarning_0001', message));
    },
    logLevel,
    entry: entryFiles,
    dependencies: dependencies.std,
    devDependencies: dependencies.dev,
    peerDependencies: dependencies.peer,
    root,
    info,
  };

  await runRules(rules, context, config.validators);

  ruleSummary(errors, warnings);
}
