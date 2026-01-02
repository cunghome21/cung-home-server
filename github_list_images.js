// github_list_images.js

import fetch from "node-fetch";
import fs from "fs";

const OWNER = "cunghome21";
const REPO = "sofa-image";
const BRANCH = "main"; // branch chứa ảnh
// Nếu private repo, đặt TOKEN_GITHUB dưới .env hoặc ở đây
const TOKEN = process.env.GITHUB_TOKEN || "";

async function getTree() {
  // lấy tree toàn bộ repo
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`,
    {
      headers: TOKEN
        ? { Authorization: `token ${TOKEN}` }
        : {},
    }
  );
  return res.json();
}

(async () => {
  const tree = await getTree();

  if (!tree.tree) {
    console.error("Không lấy được tree GitHub.");
    return;
  }

  // lọc ra file ảnh
  const imageFiles = tree.tree
    .filter((f) => /(jpg|jpeg|png|webp|gif)$/i.test(f.path))
    .map((f) => `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${f.path}`);

  console.log(`Tổng ảnh tìm được: ${imageFiles.length}`);

  fs.writeFileSync("images_list.json", JSON.stringify(imageFiles, null, 2));
  console.log("Đã lưu danh sách ảnh vào images_list.json");
})();
