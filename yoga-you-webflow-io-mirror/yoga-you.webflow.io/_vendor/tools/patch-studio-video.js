const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const pages = ["homepage.html", "about.html"];

const oldBlock =
  '<div data-poster-url="65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221 (1080p)-poster-00001.jpg" data-video-urls="65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221 (1080p)-transcode.mp4,65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221 (1080p)-transcode.webm" data-autoplay="true" data-loop="true" data-wf-ignore="true" class="video-video-section w-background-video w-background-video-atom"><video id="69728087-8357-304c-8e4b-284d630f24ec-video" autoplay="" loop="" style="background-image:url(&quot;65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221 (1080p)-poster-00001.jpg&quot;)" muted="" playsinline="" data-wf-ignore="true" data-object-fit="cover"><source src="65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221 (1080p)-transcode.mp4" data-wf-ignore="true"/><source src="65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221 (1080p)-transcode.webm" data-wf-ignore="true"/></video><div class="overlay-video"></div></div>';

const newBlock =
  '<div data-poster-url="_vendor/media/studio-hero-poster.jpg" data-video-urls="_vendor/media/studio-hero.mp4" data-autoplay="true" data-loop="true" data-wf-ignore="true" class="video-video-section w-background-video w-background-video-atom"><video autoplay="" loop="" style="background-image:url(&quot;_vendor/media/studio-hero-poster.jpg&quot;)" muted="" playsinline="" data-wf-ignore="true" data-object-fit="cover"><source src="_vendor/media/studio-hero.mp4" type="video/mp4" data-wf-ignore="true"/></video><div class="overlay-video"></div></div>';

for (const page of pages) {
  const filePath = path.join(root, page);
  let html = fs.readFileSync(filePath, "utf8");
  if (!html.includes(oldBlock)) {
    console.error("Video block not found in", page);
    process.exitCode = 1;
    continue;
  }
  html = html.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, html, "utf8");
  console.log("Updated", page);
}
