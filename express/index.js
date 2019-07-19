const express = require("express");
const axios = require("axios");
const { parse } = require("node-html-parser");
const striptags = require("striptags");
const _ = require("lodash");

const app = express();

const board = require('./board');
const topic = require('./topic');
const port = 80;

app.get("/", (req, res) => res.send("Service is running!"));

app.get("/home", async(req, res) => {
    let data = await getIndex();
    let arr = {
        big_news: queryBigNews(data),
        big_news_list: queryListBigNews(data),
        news_today_list: queryListNews(data, 'today'),
        news_yesterday_list: queryListNews(data, 'yesterday')
    };
    res.send({ result: true, data: arr });
});

app.use('/', board);
app.use('/', topic);


app.listen(port, () => console.log(`App listening on port ${port}!`));

const getIndex = async() => {
    try {
        return await axios.get("http://www.soccersuck.com/");
    } catch (error) {
        console.error(error);
    }
};

const queryBigNews = data => {
    const root = parse(data.data);
    let query_html = root.querySelector(".headline_big_desc").toString();
    let bigNews = _.map(
        _.filter(_.split(striptags(query_html), "\n"), result => {
            if (result != "") return result.replace(/\s/g, "");
        }),
        data => {
            return data.replace(/\s/g, "");
        }
    );
    let img = root.querySelector(".headline_big_pic img").attributes;
    let link = root.querySelector(".headline_main a").attributes;
    let result = {
        img: img.src,
        link: link.href,
        title: bigNews[0],
        description: bigNews[1]
    };
    return result;
};

const queryListBigNews = data => {
    const root = parse(data.data);
    let result = _.map(
        root.querySelectorAll(".headline_main a"),
        (data, index) => {
            if (index != 0) {
                let icon = _.compact(_.map(data.querySelectorAll("img"), img => {
                    if (_.includes(img.attributes.src, 'soccersuck')) {
                        return img.attributes.src;
                    }
                }))[0];
                return {
                    link: data.attributes.href,
                    icon,
                    title: striptags(data.innerHTML.replace(/\s/g, ""))
                };
            }
        }
    );
    return _.compact(result);
};

const queryListNews = (data, mode) => {
    const root = parse(data.data);
    let result = _.map(
        root.querySelectorAll(`${(mode == "today" ? ".lastpanel1":".lastpanel2")} .latestnews_tr`),
        (data, index) => {
            let title = data.attributes.title;
            let icon = _.compact(_.map(data.querySelectorAll("img"), img => {
                if (_.includes(img.attributes.src, 'soccersuck')) {
                    return img.attributes.src;
                }
            }))[0];
            let link = data.querySelector("a").attributes.href
            return { title, icon, link }
        }
    );
    return _.compact(result);
};