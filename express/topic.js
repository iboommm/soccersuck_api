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
    let reun_list = "";
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
    let str_pos = striptags(root.querySelectorAll('.topic_paginator')[1].removeWhitespace().innerHTML).indexOf('ไปที่หน้าGO');
    let max_page = striptags(root.querySelectorAll('.topic_paginator')[1].removeWhitespace().innerHTML)[str_pos - 1]
    let plap = root.querySelector('.addpoint_score').innerHTML;
    let plap_list = striptags(root.querySelector('.userPlabBox').removeWhitespace().innerHTML);
    let reun = root.querySelector('.dispoint_score').innerHTML;
    return { title, description, create_time, create_by, plap, plap_list, reun, reun_list, max_page };;
};

const queryComment = (root, page) => {
    let comment = _.map(root.querySelectorAll('.post_panel'), (cm, key) => {
        if ((key != 0 && page == 1) || page > 1) {
            let reun_list = "";
            let isTopment = _.includes(cm.querySelector('.post_head_reply').innerHTML, "Top Comment");
            let create_by = cm.querySelector('.user_name a').innerHTML;
            let create_time = cm.querySelector('.userinfo_time span').innerHTML;
            let description = cm.querySelector('.post_panel_td_right .post_desc').removeWhitespace().innerHTML;
            let plap = cm.querySelector('.addpoint_score').innerHTML;
            let plap_list = striptags(cm.querySelector('.userPlabBox').removeWhitespace().innerHTML);
            let reun = cm.querySelector('.dispoint_score').innerHTML;
            return { create_by, description, create_time, isTopment, plap, plap_list, reun, reun_list }
        }
    });
    let result = comment;
    return _.compact(result);
};



module.exports = topic;