import { CloudFunction } from '../cloud-function';

const goFunc = new CloudFunction('go_function', {
  name: 'go-func',
  source_directory: './gofunc',
  runtime: 'go113',
  entryPoint: 'Handler',
  trigger_http: true,
});

const pyFunc = new CloudFunction('py_function', {
  name: 'py-func',
  source_directory: './pyfunc',
  entryPoint: 'handler',
  trigger_http: true,
});

const goEnvs = goFunc.functionEnvironmentVariables;
const goSvcAcc = goFunc.functionServiceAccount;
const goBktUrl = goFunc.sourceBucketUrl;

const pyEnvs = pyFunc.functionEnvironmentVariables;
const pySvcAcc = pyFunc.functionServiceAccount;
const pyBktUrl = pyFunc.sourceBucketUrl;

export { goEnvs, goSvcAcc, goBktUrl, pyEnvs, pySvcAcc, pyBktUrl };
