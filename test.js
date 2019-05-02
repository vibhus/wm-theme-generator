const { exec } = require('child_process'); 

class ConsolePipe {
    constructor() {
        this.output = '';
    }
    log(str) {
        let reminder = '';
        str.split('\n').forEach((v, i, splits) => {
            if (i < splits.length - 1) {
                v && console.log(v);
            } else {
                reminder = v;
            }
        });
        return reminder;
    }
    push(str) {
        if (str) {
            this.output = this.log(this.output + str) || '';
        }
    }
    flush() {
        this.log(this.output + '\n');
    }
}

const LOGGER = {
    info: (str) => {
        console.log('\x1b[34m%s\x1b[0m', str);
    },
    warn: (str) => {
        console.log('\x1b[33m%s\x1b[0m', str);
    },
    success: (str) => {
        console.log('\x1b[42m%s\x1b[0m', str);
    },
    error: (str) => {
        console.log('\x1b[41m%s\x1b[0m', str);
    }
};

const execCommand = async (command, options, log) => {
    options = options || {};
    const spawn = exec(command, options);
    const consolePipe = new ConsolePipe();
    if (log) {
        LOGGER.info('*********************************************************************');
        LOGGER.info(`* Started executing ${command}`);
        LOGGER.info('*********************************************************************');
    }
    return new Promise((resolve, reject) => {
        const output = []; 
        spawn.stdout.on( 'data', (data) => {
            if (log) {
                consolePipe.push(data);
            } else {
                output.push(data);
            }
        });
        spawn.stderr.on( 'data', (data) => {
            if (log) {
                consolePipe.push(data);
            } else {
                output.push(data);
            }
        });
        spawn.on( 'close', code => {
            if (code === 0) {
                resolve(output.join(''));
            } else {
                reject(code + '');
            }
            if (log) {
                consolePipe.flush();
                LOGGER.info('*********************************************************************');
                LOGGER.info(`* Completed executing ${command}`);
                LOGGER.info('*********************************************************************');
            }
        });
    });
};
const generateTheme = () => {
	return execCommand('grunt themes-light', null, (data)=>{
	    console.log('logs', data);
	});
};

module.exports = generateTheme;