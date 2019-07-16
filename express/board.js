const axios = require("axios");
const { parse } = require("node-html-parser");
const striptags = require("striptags");
const _ = require("lodash");

const board = require('express').Router();

board.get("/", (req, res) => res.send("Service is running!"));

board.get("/board/:id/:page", async (req, res) => {
  let id = req.params.id || 1;
  let page = req.params.page || 1;
  let data = await getIndex(id,page);
  let arr = {
    topic: queryBoard(data)
  };
  res.send({ result: true, data: arr });
});

const getIndex = async (id,page) => {
  try {
    return await axios.post(
      "http://www.soccersuck.com/boards/loadTopicPage/",
      `id=${id}&page=${page}&limit=60`
    );
  } catch (error) {
    console.error(error);
  }
};

const queryBoard = data => {
  const root = parse(data.data);
  let result = _.map(
    root.querySelectorAll(".board_topic_row"),
    (data, index) => {
      let icon = data.querySelector(".board_topic_col_icon img").attributes.src;
      let link = data.querySelector(".board_topic_col_topic a").attributes.href;
      let title = data.querySelector(".board_topic_col_topic a").innerHTML;
      let col_data = _.compact(
        _.map(data.querySelectorAll(".board_topic_col"), (col, key) => {
          if (key > 0 && key < 4) {
            return striptags(col.querySelector("p").innerHTML);
          }
        })
      );
      let [comment, read, create_by] = col_data;
      return { icon, link, title, comment, read, create_by };
    }
  );
  return _.compact(result);
};

module.exports = board;
