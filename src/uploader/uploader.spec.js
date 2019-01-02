'use strict';

const expect = require('chai').expect;
const proxyquire = require('proxyquire');

function proxyquireUploader(opts) {
    const replaceObj = {};

    if (opts.config) {
        replaceObj['../../config'] = opts.config;
    }

    return proxyquire('./index.js', replaceObj);
}

describe('Uploader', function () {

    this.timeout(20000);

    it('_getFilePathForDeploy should build correct link with subdir path', async () => {
        const bucketSubPath = 'fakeSubPath/';
        const file = 'fakeFile';
        const buildId = 'fakeBuildId';
        const srcDir = 'fakeSrcDir';
        const isUploadFile = false;
        const branchNormalized = 'fakeBranch';
        const buildData = { pipelineId: 'fakePipeline' };
        const Uploader = await proxyquireUploader({ config: { bucketSubPath } });

        const fakeConf = {
            env: {
                buildId,
                bucketSubPath,
                branchNormalized
            }
        };

        const deployPath = Uploader._getFilePathForDeploy({ file, buildId, srcDir, isUploadFile, buildData, config: fakeConf });
        console.log(deployPath);
        expect(deployPath).to.equal('fakePipeline/fakeBranch/fakeSubPath/fakeBuildId/fakeFile');
    });

    it('_getFilePathForDeploy should build correct link with out subdir path', async () => {
        const bucketSubPath = '';
        const file = 'fakeFile';
        const buildId = 'fakeBuildId';
        const srcDir = 'fakeSrcDir';
        const isUploadFile = false;
        const branchNormalized = 'fakeBranch';
        const buildData = { pipelineId: 'fakePipeline' };
        const Uploader = await proxyquireUploader({ config: { bucketSubPath } });

        const fakeConf = {
            env: {
                buildId,
                bucketSubPath,
                branchNormalized
            }
        };

        const deployPath = Uploader._getFilePathForDeploy({ file, buildId, srcDir, isUploadFile, buildData, config: fakeConf });
        expect(deployPath).to.equal('fakePipeline/fakeBranch/fakeBuildId/fakeFile');
    });
});