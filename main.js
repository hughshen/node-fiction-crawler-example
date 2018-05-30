const fs = require('fs');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const originRequest = require('request');

var headers = {
    'User-Agent': 'User-Agent,Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
}

function request(url, callback) {
    let options = {
        url: url,
        encoding: null,
        // Proxy
        // proxy: 'http://12.12.12.12:8188',
        headers: headers
    };

    originRequest(options, callback);
};

function sleep(s) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, s);
    });
}

if (!fs.existsSync('./files')) {
    fs.mkdirSync('./files');
}

// var charset = 'utf-8';
var charset = 'gb2312';
var host = 'http://www.biqukan.com';
var listUrl = 'http://www.biqukan.com/1_1094/';
var listSelector = '.listmain dd a';
var chapterSelector = '#content';

// Chapters
request(listUrl, (err, res, body) => {
    if (err) {
        console.log(err);
        return;
    }

    let html = iconv.decode(body, charset);
    let $ = cheerio.load(html, {decodeEntities: false});

    let list = [];
    let chapterTitles = [];
    let eles = $(listSelector).each((key, val) => {
        let ele = $(val);
        let title = ele.html();

        if (/第.*?章/.test(title)) {
            chapterTitles.push(title);

            if (!fs.existsSync(`./files/${title}.txt`)) {
                list.push({
                    url: host + ele.attr('href'),
                    title: title,
                });
            }
        }
    });

    fs.writeFileSync(`./chapters.txt`, chapterTitles.join("\r\n"));
    console.log('Write chapters to file: chapters.txt');

    let start = async (list) => {
        let length = list.length;
        for (let i = 0; i < length; i++) {
            let seconds = Math.round(Math.random() * (3000 - 500)) + 1000;
            await sleep(seconds);

            chapterRequest(list[i]);
        }
    };
    start(list);
});

function chapterRequest(item) {
    request(item.url, (err, res, body) => {
        if (err) {
            console.log(err);
            return;
        }

        let html = iconv.decode(body, charset);
        let $ = cheerio.load(html, {decodeEntities: false});

        let ele = $(chapterSelector);
        let content = ele.html().replace(/<br>/g, "\r\n").replace(/^\s*/gm, '');
        let fileName = `${item.title}.txt`;

        try {
            fs.writeFileSync(`./files/${fileName}`, content);
            console.log(`${fileName}`);
        } catch (e) {
            fs.appendFileSync(`./missing.txt`, item.title + "\r\n");
            console.log(`${fileName} ERROR!!!`);
        }
    });
}
