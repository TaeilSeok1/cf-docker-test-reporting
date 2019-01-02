'use strict';

const path = require('path');
const _ = require('lodash');
const ConfigUtils = require('./ConfigUtils');

/**
 * arrayVars - customer can define array of this vars for upload multiple reports, for example REPORT_DIR.0
 */
const UPLOAD_ARRAY_VARS = ['REPORT_DIR', 'REPORT_INDEX_FILE', 'ALLURE_DIR', 'CLEAR_TEST_REPORT', 'REPORT_TYPE'];

class Config {
    static getSingleConfig() {

        const normalisedEnv = {};

        UPLOAD_ARRAY_VARS.forEach((uploadVar) => {
            if (process.env[uploadVar]) {
                normalisedEnv[_.camelCase(uploadVar)] = process.env[uploadVar];
            }
        });

        return this.getConfig(normalisedEnv);
    }

    static getMultipleConfig() {
        const environments = ConfigUtils.getMultiReportUpload(UPLOAD_ARRAY_VARS);

        const result = environments.map((env) => {
            const normalisedEnv = {};

            Object.keys(env).forEach((varName) => {
                normalisedEnv[_.camelCase(varName)] = env[varName];
            });

            return Config.getConfig(normalisedEnv);
        });

        return result;
    }

    static isMultiUpload() {
        return !!ConfigUtils.getMultiReportUpload(UPLOAD_ARRAY_VARS);
    }

    static getConfig(env = {}) {
        const {
            reportDir,
            reportIndexFile,
            allureDir,
            clearTestReport,
            reportType,
            reportWrapDir
        } = env;
        const apiHost = ConfigUtils.buildApiHost();

        /**
         * field uploadMaxSize set by SingleReportRunner, value in MB
         */
        return {
            googleStorageConfig: {
                projectId: 'local-codefresh',
                keyFilename: path.resolve(__dirname, 'google.storage.config.json')
            },
            amazonKeyFileName: path.resolve(__dirname, 'amazon.storage.config.json'),
            resultReportFolderName: 'allure-report',
            requiredVarsForUploadMode: {
                REPORT_DIR: reportDir,
                REPORT_INDEX_FILE: reportIndexFile
            },
            uploadRetryCount: 3,
            basicLinkOnReport: `${apiHost}/api/testReporting/`,
            apiHost,
            allureHistoryDir: 'history',
            reportsIndexDir: `${path.dirname(require.resolve('../_reportsIndex_'))}`,
            uploadArrayVars: UPLOAD_ARRAY_VARS,
            paymentPlanMap: {
                FREE: 30,
                CUSTOM: 30,
                BASIC: 30,
                PRO: 30,
            },
            env: {
                // bucketName - only bucket name, with out subdir path
                bucketName: ConfigUtils.getBucketName(),
                // bucketSubPath - parsed path to sub folder inside bucket
                bucketSubPath: ConfigUtils.getBucketSubPath(),
                // originBucketName - origin value that can contain subdir need to use it in some cases
                originBucketName: process.env.BUCKET_NAME,
                apiKey: process.env.CF_API_KEY,
                buildId: process.env.CF_BUILD_ID,
                volumePath: process.env.CF_VOLUME_PATH,
                branchNormalized: process.env.CF_BRANCH_TAG_NORMALIZED,
                storageIntegration: process.env.CF_STORAGE_INTEGRATION,
                sourceReportFolderName: (allureDir || 'allure-results').trim(),
                reportDir: ((reportDir || '').trim()) || undefined,
                reportIndexFile: ((reportIndexFile || '').trim()) || undefined,
                reportWrapDir: _.isNumber(reportWrapDir) ? String(reportWrapDir) : '',
                reportType: _.isString(reportType) ? reportType.replace(/[<>]/g, 'hackDetected') : 'default',
                allureDir,
                clearTestReport
            },
            buildDataSignature: {
                pipelineId: { type: 'string', required: true }
            }
        };
    }
}

module.exports = Config;