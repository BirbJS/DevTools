/*
 * Copyright (c) 2021, knokbak and contributors.
 *
 * The Birb.JS Project: https://birb.js.org
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Chalk from 'chalk';
import Crypit from 'crypit';
import FS from 'fs';
import DevTools from '../index';

/**
 * Imagine NOT having fancy logging...
 */
export default class Logger {

    fileName: string = null!;
    parent: DevTools = null!;
    crypit: Crypit = null!;

    constructor (parent: DevTools) {
        this.parent = parent;
        this.crypit = new Crypit();
        Logger.fancy();

        let d = new Date();
        if (!FS.existsSync(process.cwd() + '/logs/')) FS.mkdirSync(process.cwd() + '/logs/');
        this.fileName = `debug-${d.getDate()}-${d.getMonth()}-${d.getFullYear()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}-${d.getMilliseconds()}.${this.crypit.id.unique.short()}.log`;
        this.write(`[info] file creation: ${this.fileName}`, true);
        this.write(`[info] Birb.JS Debug Log start at ${d.toISOString()}`);
        
        process.on('exit', this.cleanup.bind(this));
        process.on('SIGINT', this.cleanupSIGINT.bind(this));
    }

    log (...message: any) {
        console.log(Chalk.whiteBright('[log]'), this.sanitize(...message));
        this.write(`[log @ ${Logger.date()}] ${Logger.format(...message)}`);
    }

    warn (...message: any) {
        console.warn(Chalk.yellowBright('[warn]'), this.sanitize(...message));
        this.write(`[warn @ ${Logger.date()}] ${Logger.format(...message)}`);
    }

    error (...message: any) {
        console.error(Chalk.redBright('[error]'), this.sanitize(...message));
        this.write(`[error @ ${Logger.date()}] ${Logger.format(...message)}`);
    }

    send (...message: any) {
        console.error(Chalk.greenBright('[SEND]'), this.sanitize(...message));
        this.write(`[SEND @ ${Logger.date()}] ${Logger.format(...message)}`);
    }

    receive (...message: any) {
        console.error(Chalk.cyanBright('[RECEIVE]'), this.sanitize(...message));
        this.write(`[RECEIVE @ ${Logger.date()}] ${Logger.format(...message)}`);
    }

    http (...message: any) {
        console.error(Chalk.blueBright('[HTTP]'), this.sanitize(...message));
        this.write(`[HTTP @ ${Logger.date()}] ${Logger.format(...message)}`);
    }

    private sanitize (...message: string[]) {
        if (this.parent.token) {
            let array: string[] = [];
            for ( let i = 0; i < message.length; ++i ) {
                array.push(message[i].replace(new RegExp(this.parent.token.replace(/\./g, "\\.")), '*'.repeat(54)));
            }
            return array;
        } else {
            return message;
        }
    }

    private write (content: string, set: boolean = false) {
        let current = set ? '' : FS.readFileSync(process.cwd() + '/logs/' + this.fileName, 'utf8') + '\n';
        FS.writeFileSync(process.cwd() + '/logs/' + this.fileName, current + content);
    }

    private cleanup () {
        this.write(`[info] Birb.JS Debug Log end at ${new Date().toISOString()}`);
    }

    private cleanupSIGINT () {
        this.write(`[info] SIGINT (ctrl+c) received`);
        this.cleanup();
        process.exit(2);
    }

    private static date () {
        let d = new Date();
        return `${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}-${d.getMilliseconds()}`;
    }

    private static format (...message: any[]) {
        let content = '';
        for ( let i = 0; i < message.length; ++i ) content += message[i] + '\n';
        return content;
    }

    /**
     * This is why god left us.
     */
    private static fancy () {
        console.log("\n\n" + "\u001B[48;2;64;60;58m\u001B[38;2;57;55;53m▄\u001B[48;2;54;51;46m\u001B[38;2;55;52;48m▄\u001B[48;2;55;52;48m\u001B[38;2;52;49;45m▄\u001B[48;2;55;51;49m\u001B[38;2;52;49;44m▄\u001B[48;2;50;48;45m\u001B[38;2;48;45;43m▄\u001B[48;2;40;38;37m\u001B[38;2;39;38;36m▄\u001B[48;2;48;47;45m\u001B[38;2;47;46;44m▄\u001B[48;2;48;46;45m\u001B[38;2;48;47;46m▄\u001B[48;2;52;50;51m\u001B[38;2;50;49;49m▄\u001B[48;2;64;62;62m\u001B[38;2;63;62;63m▄\u001B[48;2;65;64;62m\u001B[38;2;73;74;78m▄\u001B[48;2;66;65;65m\u001B[38;2;88;92;103m▄\u001B[48;2;69;70;72m\u001B[38;2;99;104;115m▄\u001B[48;2;71;73;75m\u001B[38;2;91;95;102m▄\u001B[48;2;74;77;80m\u001B[38;2;82;86;92m▄\u001B[48;2;74;79;83m\u001B[38;2;81;87;93m▄\u001B[48;2;79;85;90m\u001B[38;2;86;93;100m▄\u001B[48;2;82;89;95m\u001B[38;2;90;98;106m▄\u001B[48;2;85;94;101m\u001B[38;2;93;102;111m▄\u001B[48;2;89;98;106m\u001B[38;2;95;105;115m▄\u001B[48;2;99;107;117m\u001B[38;2;99;108;118m▄\u001B[48;2;109;116;125m\u001B[38;2;110;118;127m▄\u001B[48;2;112;118;126m\u001B[38;2;116;123;131m▄\u001B[48;2;123;128;134m\u001B[38;2;124;129;136m▄\u001B[0m" +
        "\n\u001B[48;2;57;55;53m\u001B[38;2;61;57;53m▄\u001B[48;2;57;54;51m\u001B[38;2;55;51;49m▄\u001B[48;2;48;45;42m \u001B[48;2;51;48;43m\u001B[38;2;48;45;42m▄\u001B[48;2;46;44;41m \u001B[48;2;41;40;38m\u001B[38;2;45;43;40m▄\u001B[48;2;50;48;46m\u001B[38;2;51;49;46m▄\u001B[48;2;51;50;50m\u001B[38;2;53;51;50m▄\u001B[48;2;50;50;50m\u001B[38;2;64;65;71m▄\u001B[48;2;73;75;83m\u001B[38;2;120;130;153m▄\u001B[48;2;120;128;151m\u001B[38;2;139;147;168m▄\u001B[48;2;140;148;174m\u001B[38;2;145;152;173m▄\u001B[48;2;160;169;191m\u001B[38;2;176;182;200m▄\u001B[48;2;165;174;192m\u001B[38;2;189;195;209m▄\u001B[48;2;136;145;159m\u001B[38;2;181;188;201m▄\u001B[48;2;92;99;107m\u001B[38;2;140;150;165m▄\u001B[48;2;92;100;108m\u001B[38;2;98;107;117m▄\u001B[48;2;97;105;115m\u001B[38;2;103;112;122m▄\u001B[48;2;101;111;120m\u001B[38;2;106;116;128m▄\u001B[48;2;103;114;125m\u001B[38;2;110;122;134m▄\u001B[48;2;105;116;127m\u001B[38;2;112;124;136m▄\u001B[48;2;113;122;132m\u001B[38;2;117;127;137m▄\u001B[48;2;120;127;136m\u001B[38;2;117;126;136m▄\u001B[48;2;125;132;139m\u001B[38;2;121;128;134m▄\u001B[0m" +
        "\n\u001B[48;2;64;60;57m\u001B[38;2;69;66;65m▄\u001B[48;2;55;52;49m\u001B[38;2;56;53;50m▄\u001B[48;2;52;47;44m\u001B[38;2;54;49;45m▄\u001B[48;2;45;42;39m\u001B[38;2;43;39;36m▄\u001B[48;2;49;47;44m\u001B[38;2;50;48;45m▄\u001B[48;2;53;50;47m\u001B[38;2;55;53;50m▄\u001B[48;2;51;50;46m\u001B[38;2;51;49;46m▄\u001B[48;2;58;56;57m\u001B[38;2;68;68;72m▄\u001B[48;2;90;94;109m\u001B[38;2;100;105;118m▄\u001B[48;2;143;153;173m\u001B[38;2;141;149;170m▄\u001B[48;2;115;118;127m\u001B[38;2;137;145;163m▄\u001B[48;2;120;126;139m\u001B[38;2;112;117;126m▄\u001B[48;2;157;163;177m\u001B[38;2;124;130;142m▄\u001B[48;2;163;167;176m\u001B[38;2;144;148;157m▄\u001B[48;2;149;149;150m\u001B[38;2;182;187;197m▄\u001B[48;2;176;185;200m\u001B[38;2;182;189;203m▄\u001B[48;2;111;121;132m\u001B[38;2;122;131;143m▄\u001B[48;2;105;115;125m\u001B[38;2;104;114;126m▄\u001B[48;2;109;120;132m\u001B[38;2;110;122;134m▄\u001B[48;2;113;125;137m\u001B[38;2;117;129;142m▄\u001B[48;2;116;128;140m\u001B[38;2;118;130;143m▄\u001B[48;2;116;128;139m\u001B[38;2;117;128;140m▄\u001B[48;2;116;126;136m \u001B[48;2;117;124;133m\u001B[38;2;116;123;132m▄\u001B[0m" +
        "\n\u001B[48;2;58;56;55m\u001B[38;2;46;44;45m▄\u001B[48;2;55;52;50m\u001B[38;2;53;50;48m▄\u001B[48;2;56;52;48m\u001B[38;2;62;58;52m▄\u001B[48;2;42;37;35m\u001B[38;2;44;41;38m▄\u001B[48;2;49;46;43m\u001B[38;2;48;45;43m▄\u001B[48;2;55;53;50m\u001B[38;2;56;54;51m▄\u001B[48;2;51;49;48m\u001B[38;2;56;55;56m▄\u001B[48;2;78;80;90m\u001B[38;2;102;108;127m▄\u001B[48;2;124;133;155m\u001B[38;2;154;164;189m▄\u001B[48;2;145;154;171m\u001B[38;2;172;181;200m▄\u001B[48;2;144;152;166m\u001B[38;2;158;166;180m▄\u001B[48;2;122;129;135m\u001B[38;2;137;145;151m▄\u001B[48;2;100;105;112m\u001B[38;2;137;143;147m▄\u001B[48;2;144;149;156m\u001B[38;2;151;157;163m▄\u001B[48;2;189;194;203m\u001B[38;2;175;180;187m▄\u001B[48;2;188;194;205m\u001B[38;2;193;199;210m▄\u001B[48;2;143;152;166m\u001B[38;2;171;181;195m▄\u001B[48;2;104;114;126m\u001B[38;2;109;119;130m▄\u001B[48;2;108;120;131m\u001B[38;2;104;115;125m▄\u001B[48;2;113;125;137m\u001B[38;2;108;120;131m▄\u001B[48;2;113;126;138m\u001B[38;2;106;118;130m▄\u001B[48;2;114;125;136m\u001B[38;2;108;118;128m▄\u001B[48;2;115;123;133m\u001B[38;2;109;118;126m▄\u001B[48;2;114;122;129m\u001B[38;2;110;117;123m▄\u001B[0m" + Chalk.magenta("  Birb.JS DevTools") +
        "\n\u001B[48;2;53;50;49m\u001B[38;2;56;52;52m▄\u001B[48;2;63;58;55m\u001B[38;2;56;52;49m▄\u001B[48;2;62;58;53m\u001B[38;2;59;55;54m▄\u001B[48;2;43;40;39m\u001B[38;2;43;40;42m▄\u001B[48;2;47;46;44m\u001B[38;2;45;41;42m▄\u001B[48;2;54;52;51m\u001B[38;2;63;63;67m▄\u001B[48;2;83;85;98m\u001B[38;2;94;98;115m▄\u001B[48;2;109;115;133m\u001B[38;2;105;111;121m▄\u001B[48;2;144;153;168m\u001B[38;2;135;142;150m▄\u001B[48;2;160;169;182m\u001B[38;2;141;149;154m▄\u001B[48;2;169;177;186m\u001B[38;2;155;163;167m▄\u001B[48;2;163;169;172m\u001B[38;2;171;177;182m▄\u001B[48;2;152;156;151m\u001B[38;2;177;182;185m▄\u001B[48;2;154;158;153m\u001B[38;2;172;179;181m▄\u001B[48;2;175;181;184m\u001B[38;2;170;178;181m▄\u001B[48;2;187;194;203m\u001B[38;2;161;168;173m▄\u001B[48;2;168;177;191m\u001B[38;2;161;170;180m▄\u001B[48;2;125;135;149m\u001B[38;2;136;147;157m▄\u001B[48;2;97;108;117m\u001B[38;2;98;108;113m▄\u001B[48;2;100;110;120m\u001B[38;2;93;101;110m▄\u001B[48;2;99;110;120m\u001B[38;2;92;101;111m▄\u001B[48;2;104;113;122m\u001B[38;2;101;109;116m▄\u001B[48;2;106;113;120m\u001B[38;2;106;112;117m▄\u001B[48;2;100;107;113m\u001B[38;2;94;100;107m▄\u001B[0m" + Chalk.magentaBright("  Ease the pain of developing Birb.JS...") +
        "\n\u001B[48;2;50;47;47m\u001B[38;2;51;48;47m▄\u001B[48;2;50;46;44m\u001B[38;2;50;46;45m▄\u001B[48;2;60;57;55m\u001B[38;2;58;54;52m▄\u001B[48;2;47;45;46m\u001B[38;2;46;44;44m▄\u001B[48;2;49;46;47m\u001B[38;2;48;46;47m▄\u001B[48;2;78;77;85m\u001B[38;2;80;80;87m▄\u001B[48;2;90;93;103m\u001B[38;2;90;90;98m▄\u001B[48;2;109;114;123m\u001B[38;2;116;120;126m▄\u001B[48;2;136;143;148m\u001B[38;2;141;148;150m▄\u001B[48;2;133;141;143m\u001B[38;2;132;139;138m▄\u001B[48;2;143;151;153m\u001B[38;2;132;139;137m▄\u001B[48;2;155;162;162m\u001B[38;2;146;152;150m▄\u001B[48;2;169;175;177m\u001B[38;2;162;168;166m▄\u001B[48;2;166;172;174m\u001B[38;2;171;177;179m▄\u001B[48;2;163;169;171m\u001B[38;2;152;158;155m▄\u001B[48;2;147;154;154m\u001B[38;2;135;140;136m▄\u001B[48;2;145;152;157m\u001B[38;2;136;143;145m▄\u001B[48;2;127;138;144m\u001B[38;2;116;124;129m▄\u001B[48;2;102;115;110m\u001B[38;2;88;98;97m▄\u001B[48;2;100;111;112m\u001B[38;2;92;102;100m▄\u001B[48;2;85;93;100m\u001B[38;2;79;86;91m▄\u001B[48;2;95;101;107m\u001B[38;2;82;87;93m▄\u001B[48;2;107;110;114m\u001B[38;2;99;101;104m▄\u001B[48;2;90;94;100m\u001B[38;2;83;86;91m▄\u001B[0m" +
        "\n\u001B[48;2;52;48;47m\u001B[38;2;47;43;44m▄\u001B[48;2;48;45;43m\u001B[38;2;47;44;43m▄\u001B[48;2;53;50;48m\u001B[38;2;49;47;46m▄\u001B[48;2;45;44;43m\u001B[38;2;41;40;39m▄\u001B[48;2;44;45;43m\u001B[38;2;45;44;44m▄\u001B[48;2;75;75;79m\u001B[38;2;76;76;76m▄\u001B[48;2;87;87;91m\u001B[38;2;89;89;91m▄\u001B[48;2;120;125;127m\u001B[38;2;124;129;128m▄\u001B[48;2;142;150;149m\u001B[38;2;139;145;142m▄\u001B[48;2;141;149;147m\u001B[38;2;144;151;148m▄\u001B[48;2;138;145;143m\u001B[38;2;147;154;151m▄\u001B[48;2;146;153;150m\u001B[38;2;149;155;150m▄\u001B[48;2;167;174;174m\u001B[38;2;151;157;149m▄\u001B[48;2;172;178;178m\u001B[38;2;155;160;154m▄\u001B[48;2;164;170;170m\u001B[38;2;162;168;165m▄\u001B[48;2;148;153;152m \u001B[48;2;141;149;152m\u001B[38;2;137;143;146m▄\u001B[48;2;99;105;109m\u001B[38;2;88;97;93m▄\u001B[48;2;75;82;82m\u001B[38;2;77;87;79m▄\u001B[48;2;71;78;80m\u001B[38;2;74;83;78m▄\u001B[48;2;68;73;78m\u001B[38;2;62;67;70m▄\u001B[48;2;74;77;82m\u001B[38;2;71;74;77m▄\u001B[48;2;90;91;93m\u001B[38;2;79;83;81m▄\u001B[48;2;77;80;82m\u001B[38;2;76;86;74m▄\u001B[0m" + Chalk.gray("  I guess you could make Birb.JS without this.") +
        "\n\u001B[48;2;44;40;41m\u001B[38;2;35;31;32m▄\u001B[48;2;44;41;41m\u001B[38;2;43;40;39m▄\u001B[48;2;46;44;42m\u001B[38;2;44;42;40m▄\u001B[48;2;36;34;33m\u001B[38;2;36;34;32m▄\u001B[48;2;43;41;42m\u001B[38;2;40;39;39m▄\u001B[48;2;75;73;73m\u001B[38;2;73;71;71m▄\u001B[48;2;89;88;89m\u001B[38;2;92;91;89m▄\u001B[48;2;124;127;122m\u001B[38;2;120;121;113m▄\u001B[48;2;127;131;125m\u001B[38;2;122;123;115m▄\u001B[48;2;139;144;138m\u001B[38;2;131;135;126m▄\u001B[48;2;146;152;146m\u001B[38;2;144;149;139m▄\u001B[48;2;150;155;147m\u001B[38;2;145;150;139m▄\u001B[48;2;156;162;153m\u001B[38;2;156;161;151m▄\u001B[48;2;152;157;148m\u001B[38;2;154;158;149m▄\u001B[48;2;156;161;156m\u001B[38;2;153;156;147m▄\u001B[48;2;142;146;141m\u001B[38;2;118;118;109m▄\u001B[48;2;119;122;120m\u001B[38;2;93;93;89m▄\u001B[48;2;71;75;74m\u001B[38;2;58;59;60m▄\u001B[48;2;64;72;68m\u001B[38;2;53;55;56m▄\u001B[48;2;64;73;68m\u001B[38;2;56;60;58m▄\u001B[48;2;60;66;65m\u001B[38;2;56;62;60m▄\u001B[48;2;69;77;74m\u001B[38;2;58;65;61m▄\u001B[48;2;71;80;72m\u001B[38;2;56;63;57m▄\u001B[48;2;64;73;63m\u001B[38;2;52;56;54m▄\u001B[0m" + Chalk.gray("  Go fight some bugs, and have fun, friendo! :)") +
        "\n\u001B[48;2;33;31;32m\u001B[38;2;33;31;33m▄\u001B[48;2;42;39;37m\u001B[38;2;40;36;35m▄\u001B[48;2;42;40;38m\u001B[38;2;40;38;36m▄\u001B[48;2;34;32;32m\u001B[38;2;34;33;32m▄\u001B[48;2;39;37;37m\u001B[38;2;39;37;38m▄\u001B[48;2;73;72;70m\u001B[38;2;75;73;70m▄\u001B[48;2;95;94;87m\u001B[38;2;94;92;84m▄\u001B[48;2;111;111;102m\u001B[38;2;97;96;90m▄\u001B[48;2;116;117;109m\u001B[38;2;114;115;106m▄\u001B[48;2;128;130;119m\u001B[38;2;129;130;118m▄\u001B[48;2;141;144;130m\u001B[38;2;136;137;123m▄\u001B[48;2;150;153;141m\u001B[38;2;141;142;127m▄\u001B[48;2;148;150;137m\u001B[38;2;147;149;134m▄\u001B[48;2;146;148;134m\u001B[38;2;143;144;129m▄\u001B[48;2;132;133;121m\u001B[38;2;110;108;96m▄\u001B[48;2;103;102;93m\u001B[38;2;103;100;92m▄\u001B[48;2;76;77;72m\u001B[38;2;53;54;52m▄\u001B[48;2;49;50;51m\u001B[38;2;44;44;46m▄\u001B[48;2;48;48;50m\u001B[38;2;44;43;46m▄\u001B[48;2;48;50;50m\u001B[38;2;45;46;46m▄\u001B[48;2;52;57;54m\u001B[38;2;51;55;52m▄\u001B[48;2;53;60;55m\u001B[38;2;48;53;50m▄\u001B[48;2;53;59;53m\u001B[38;2;44;47;45m▄\u001B[48;2;51;56;50m\u001B[38;2;45;48;45m▄\u001B[0m  " + Chalk.underline.gray("https://github.com/BirbJS/Birb") +
        "\n\u001B[48;2;39;36;37m\u001B[38;2;39;38;37m▄\u001B[48;2;41;37;36m\u001B[38;2;38;36;35m▄\u001B[48;2;40;37;36m\u001B[38;2;40;39;36m▄\u001B[48;2;35;34;34m\u001B[38;2;39;39;35m▄\u001B[48;2;40;38;39m\u001B[38;2;38;38;36m▄\u001B[48;2;74;72;69m\u001B[38;2;52;50;49m▄\u001B[48;2;72;69;65m\u001B[38;2;43;41;41m▄\u001B[48;2;84;82;78m\u001B[38;2;72;70;68m▄\u001B[48;2;115;115;106m\u001B[38;2;112;111;103m▄\u001B[48;2;128;128;116m\u001B[38;2;134;133;120m▄\u001B[48;2;137;137;121m\u001B[38;2;142;141;124m▄\u001B[48;2;143;143;128m\u001B[38;2;154;155;142m▄\u001B[48;2;149;149;135m\u001B[38;2;159;160;152m▄\u001B[48;2;128;126;114m\u001B[38;2;104;101;95m▄\u001B[48;2;101;98;91m\u001B[38;2;62;60;61m▄\u001B[48;2;64;62;62m\u001B[38;2;37;35;40m▄\u001B[48;2;41;41;42m\u001B[38;2;36;35;38m▄\u001B[48;2;40;41;41m\u001B[38;2;35;35;37m▄\u001B[48;2;39;39;42m\u001B[38;2;35;35;37m▄\u001B[48;2;38;38;40m\u001B[38;2;34;34;35m▄\u001B[48;2;41;41;41m\u001B[38;2;34;34;35m▄\u001B[48;2;39;39;40m\u001B[38;2;33;33;35m▄\u001B[48;2;36;36;38m\u001B[38;2;32;32;34m▄\u001B[48;2;35;36;36m\u001B[38;2;37;39;36m▄\u001B[0m" +
        "\n\u001B[48;2;33;34;32m\u001B[38;2;44;44;42m▄\u001B[48;2;37;36;34m\u001B[38;2;45;43;41m▄\u001B[48;2;40;43;36m\u001B[38;2;40;39;36m▄\u001B[48;2;40;45;36m\u001B[38;2;39;40;36m▄\u001B[48;2;40;43;35m\u001B[38;2;41;42;36m▄\u001B[48;2;36;36;35m\u001B[38;2;39;37;37m▄\u001B[48;2;36;34;36m\u001B[38;2;38;35;37m▄\u001B[48;2;58;56;56m\u001B[38;2;44;43;43m▄\u001B[48;2;110;109;103m\u001B[38;2;74;73;74m▄\u001B[48;2;145;143;134m\u001B[38;2;133;132;130m▄\u001B[48;2;167;167;162m\u001B[38;2;131;129;132m▄\u001B[48;2;187;189;190m\u001B[38;2;171;171;177m▄\u001B[48;2;164;166;166m\u001B[38;2;167;167;174m▄\u001B[48;2;64;63;63m\u001B[38;2;95;95;100m▄\u001B[48;2;36;35;39m\u001B[38;2;47;45;45m▄\u001B[48;2;32;31;35m\u001B[38;2;48;44;44m▄\u001B[48;2;30;30;33m\u001B[38;2;43;40;41m▄\u001B[48;2;29;29;31m\u001B[38;2;39;38;39m▄\u001B[48;2;32;32;33m\u001B[38;2;37;38;36m▄\u001B[48;2;31;32;31m\u001B[38;2;35;36;35m▄\u001B[48;2;36;37;35m\u001B[38;2;42;43;40m▄\u001B[48;2;36;36;36m\u001B[38;2;43;42;41m▄\u001B[48;2;35;36;35m\u001B[38;2;46;46;44m▄\u001B[48;2;37;39;36m\u001B[38;2;46;45;44m▄\u001B[0m" +
        "\n\u001B[48;2;67;62;58m\u001B[38;2;89;79;69m▄\u001B[48;2;68;62;59m\u001B[38;2;87;77;68m▄\u001B[48;2;66;60;56m\u001B[38;2;84;74;64m▄\u001B[48;2;68;61;56m\u001B[38;2;85;74;64m▄\u001B[48;2;66;59;54m\u001B[38;2;82;72;62m▄\u001B[48;2;65;59;54m\u001B[38;2;80;71;61m▄\u001B[48;2;64;59;53m\u001B[38;2;78;70;60m▄\u001B[48;2;62;58;53m\u001B[38;2;72;69;59m▄\u001B[48;2;63;59;55m\u001B[38;2;69;68;59m▄\u001B[48;2;70;64;60m\u001B[38;2;72;67;59m▄\u001B[48;2;73;69;66m\u001B[38;2;78;72;64m▄\u001B[48;2;82;77;73m\u001B[38;2;76;72;63m▄\u001B[48;2;95;91;90m\u001B[38;2;71;70;60m▄\u001B[48;2;89;84;82m\u001B[38;2;73;66;60m▄\u001B[48;2;71;65;61m\u001B[38;2;74;67;61m▄\u001B[48;2;76;69;65m\u001B[38;2;71;66;60m▄\u001B[48;2;76;69;67m\u001B[38;2;79;72;67m▄\u001B[48;2;74;68;68m\u001B[38;2;79;72;68m▄\u001B[48;2;65;61;61m\u001B[38;2;84;76;70m▄\u001B[48;2;64;60;59m\u001B[38;2;86;78;72m▄\u001B[48;2;68;63;63m\u001B[38;2;89;81;76m▄\u001B[48;2;72;65;64m\u001B[38;2;86;78;73m▄\u001B[48;2;72;66;66m\u001B[38;2;86;78;76m▄\u001B[48;2;74;68;68m\u001B[38;2;89;81;81m▄\u001B[0m" + "\n\n");
    }

}
