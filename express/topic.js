const axios = require("axios");
const { parse } = require("node-html-parser");
const striptags = require("striptags");
const _ = require("lodash");

const topic = require('express').Router();

topic.get("/", (req, res) => res.send("Service is running!"));

topic.get("/topic/:id", async(req, res) => {
    let id = req.params.id || 1;
    let page = 1;
    let data = await getTopic(id, page);
    let root = parse(data.data);
    let arr = {};
    if (page == 1)
        arr = {
            topic: queryTopic(root),
            comment: queryComment(root, page)
        };
    else
        arr = {
            comment: queryComment(root, page)
        };
    res.send({ result: true, data: arr });
});

topic.get("/topic/:id/:page", async(req, res) => {
    let id = req.params.id || 1;
    let page = req.params.page || 1;
    let data = await getTopic(id, page);
    let root = parse(data.data);
    let arr = {};
    if (page == 1)
        arr = {
            topic: queryTopic(root),
            comment: queryComment(root, page)
        };
    else
        arr = {
            comment: queryComment(root, page)
        };
    res.send({ result: true, data: arr });
});

const getTopic = async(id, page) => {
    try {
        return await axios.get(
            `http://www.soccersuck.com/boards/topic/${id}/${page}`
        );
    } catch (error) {
        console.error(error);
    }
};

const queryTopic = root => {
    let [title, description, datetime, create_by] = ['', '', '', '']
    if (root.querySelector(".post_head_topic_news")) {
        title = root.querySelector(".post_head_topic_news").innerHTML;
        description = root.querySelector(".post_desc").removeWhitespace().innerHTML;
        create_time = _.split(root.querySelector(".topic_thead_td").innerHTML, "by")[0];
        create_by = striptags(_.split(root.querySelector(".topic_thead_td").innerHTML, "by")[1]).slice(1, -1);

    } else {
        title = root.querySelector(".post_panel_td_right .post_head_topic").innerHTML;
        description = root.querySelector(".post_desc").removeWhitespace().innerHTML;
        create_time = root.querySelector('.userinfo_time span').innerHTML;
        create_by = root.querySelector('.user_name a').innerHTML;
    }
    let result = { title, description, create_time, create_by };
    return result;
};

const queryComment = (root, page) => {
    let comment = _.map(root.querySelectorAll('.post_panel'), (cm, key) => {
        if ((key != 0 && page == 1) || page > 1) {
            let create_by = cm.querySelector('.user_name a').innerHTML;
            let create_time = cm.querySelector('.userinfo_time span').innerHTML;
            let description = cm.querySelector('.post_panel_td_right .post_desc').removeWhitespace().innerHTML;
            return { create_by, description, create_time }
        }
    });
    let result = comment;
    return _.compact(result);
};



module.exports = topic;