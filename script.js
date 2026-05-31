// ---------- サイドパネルのタブ切替 ----------
const tabChapters = document.getElementById('tabChapters');
const tabChat = document.getElementById('tabChat');
const paneChapters = document.getElementById('paneChapters');
const paneChat = document.getElementById('paneChat');
const chatBadge = document.getElementById('chatBadge');

function selectPanel(tab) {
  const chat = tab === 'chat';
  tabChat.classList.toggle('is-active', chat);
  tabChapters.classList.toggle('is-active', !chat);
  tabChat.setAttribute('aria-selected', String(chat));
  tabChapters.setAttribute('aria-selected', String(!chat));
  paneChat.classList.toggle('is-active', chat);
  paneChapters.classList.toggle('is-active', !chat);
  paneChat.hidden = !chat;
  paneChapters.hidden = chat;
}
tabChapters.addEventListener('click', () => selectPanel('chapters'));
tabChat.addEventListener('click', () => {
  selectPanel('chat');
  chatBadge.hidden = true;
});

// ---------- チャプター選択 ----------
const lectureTitle = document.getElementById('lectureTitle');
const videoTitle = document.getElementById('videoTitle');
const totTime = document.getElementById('totTime');
const curTime = document.getElementById('curTime');

document.querySelectorAll('.chapter-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.chapter-item').forEach((el) => {
      el.classList.remove('is-current');
      const state = el.querySelector('.chapter-state');
      if (!el.classList.contains('is-done')) {
        const num = el.querySelector('.chapter-num')?.textContent.replace(/[^0-9]/g, '') || '';
        state.innerHTML = `<span class="chapter-dot">${num}</span>`;
      }
    });
    item.classList.add('is-current');
    item.querySelector('.chapter-state').innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

    lectureTitle.textContent = item.dataset.title;
    totTime.textContent = item.dataset.time;
    curTime.textContent = '0:00';
    document.getElementById('progressFill').style.width = '0%';
    player.classList.remove('is-complete', 'is-playing');
    // ユーザーが章を移動したら、リプレイによる自動復元を無効化
    lastCompleted = null;
    lastAdvanced = null;
  });
});

// ---------- 再生／一時停止トグル（UIのみ） ----------
const player = document.getElementById('videoPlayer');
const playBtn = document.getElementById('playBtn');
const iconPlay = playBtn.querySelector('.icon-play');
const iconPause = playBtn.querySelector('.icon-pause');

function togglePlay() {
  const playing = player.classList.toggle('is-playing');
  iconPlay.hidden = playing;
  iconPause.hidden = !playing;
}
playBtn.addEventListener('click', togglePlay);

// ---------- 視聴完了（動画エリアをクリック） ----------
const videoScreen = document.querySelector('.video-screen');
const progressFill = document.getElementById('progressFill');
const vcStars = Array.from(document.querySelectorAll('.vc-star'));
const vcRatingText = document.getElementById('vcRatingText');
const vcChatPrompt = document.getElementById('vcChatPrompt');
const vcReplay = document.getElementById('vcReplay');
let vcRating = 0;
let lastCompleted = null;
let lastAdvanced = null;

const SVG_NS = 'http://www.w3.org/2000/svg';
const CHECK_PATH_D = 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z';
const PLAY_PATH_D = 'M8 5v14l11-7z';
function makeIconSvg(size, pathD) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'currentColor');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  return svg;
}

function setChapterDone(item) {
  item.classList.remove('is-current');
  item.classList.add('is-done');
  item.querySelector('.chapter-state').replaceChildren(makeIconSvg(16, CHECK_PATH_D));
  const fill = item.querySelector('.chapter-bar-fill');
  if (fill) fill.style.width = '100%';
  const pct = item.querySelector('.chapter-percent');
  if (pct) pct.textContent = '視聴 100%';
}
function setChapterCurrent(item, progress) {
  item.classList.remove('is-done');
  item.classList.add('is-current');
  item.querySelector('.chapter-state').replaceChildren(makeIconSvg(14, PLAY_PATH_D));
  if (typeof progress === 'number') {
    const fill = item.querySelector('.chapter-bar-fill');
    if (fill) fill.style.width = progress + '%';
    const pct = item.querySelector('.chapter-percent');
    if (pct) pct.textContent = '視聴 ' + progress + '%';
  }
}
function setChapterPending(item) {
  item.classList.remove('is-done', 'is-current');
  const num = item.querySelector('.chapter-num')?.textContent.replace(/[^0-9]/g, '') || '';
  const dot = document.createElement('span');
  dot.className = 'chapter-dot';
  dot.textContent = num;
  item.querySelector('.chapter-state').replaceChildren(dot);
  const fill = item.querySelector('.chapter-bar-fill');
  if (fill) fill.style.width = '0%';
  const pct = item.querySelector('.chapter-percent');
  if (pct) pct.textContent = '視聴 0%';
}

function completeVideo() {
  if (player.classList.contains('is-complete')) return;
  player.classList.add('is-complete', 'is-playing');
  progressFill.style.width = '100%';
  curTime.textContent = totTime.textContent;
  // 視聴完了でチャットが届く → 赤丸を表示（既にチャットタブを開いていれば不要）
  if (!tabChat.classList.contains('is-active')) chatBadge.hidden = false;
  // 完了した章を done に、次の章を current に
  const cur = document.querySelector('.chapter-item.is-current');
  if (cur) {
    setChapterDone(cur);
    lastCompleted = cur;
    const next = cur.nextElementSibling;
    if (next && next.classList.contains('chapter-item')) {
      setChapterCurrent(next);
      lastAdvanced = next;
    } else {
      lastAdvanced = null;
    }
  }
}
videoScreen.addEventListener('click', completeVideo);

function paintStars(n) {
  vcStars.forEach((s, i) => s.classList.toggle('is-on', i < n));
}
vcStars.forEach((s, i) => {
  s.addEventListener('mouseenter', () => paintStars(i + 1));
  s.addEventListener('click', (e) => {
    e.stopPropagation();
    vcRating = i + 1;
    paintStars(vcRating);
    vcRatingText.textContent = `評価ありがとうございました！（★${vcRating}）`;
  });
});
document.getElementById('vcStars').addEventListener('mouseleave', () => paintStars(vcRating));

vcChatPrompt.addEventListener('click', (e) => {
  e.stopPropagation();
  selectPanel('chat');
  chatBadge.hidden = true;
});

vcReplay.addEventListener('click', (e) => {
  e.stopPropagation();
  player.classList.remove('is-complete', 'is-playing');
  vcRating = 0;
  paintStars(0);
  vcRatingText.textContent = '星をタップして評価してください';
  progressFill.style.width = '10%';
  chatBadge.hidden = true;
  // 章状態を元に戻す（完了→現在に、現在→未視聴に）
  if (lastAdvanced) setChapterPending(lastAdvanced);
  if (lastCompleted) setChapterCurrent(lastCompleted, 0);
  lastCompleted = null;
  lastAdvanced = null;
});

// ---------- チャット送信（UIのみ） ----------
const chatForm = document.getElementById('chatForm');
const chatField = document.getElementById('chatField');
const chatThread = document.getElementById('chatThread');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatField.value.trim();
  if (!text) return;

  const row = document.createElement('div');
  row.className = 'chat-row chat-me';
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;
  row.appendChild(bubble);
  chatThread.appendChild(row);

  chatField.value = '';
  chatThread.scrollTop = chatThread.scrollHeight;
});

// ---------- 全画面（動画＋チャプター/チャットを同時に拡大） ----------
const fsBtn = document.getElementById('fullscreenBtn');
const fsTarget = document.querySelector('.viewer-grid');

function currentFsElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}
function enterFullscreen() {
  if (fsTarget.requestFullscreen) fsTarget.requestFullscreen();
  else if (fsTarget.webkitRequestFullscreen) fsTarget.webkitRequestFullscreen();
}
function exitFullscreen() {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
}
fsBtn.addEventListener('click', () => {
  if (currentFsElement()) exitFullscreen();
  else enterFullscreen();
});
function onFsChange() {
  const inFs = currentFsElement() === fsTarget;
  fsTarget.classList.toggle('is-fullscreen', inFs);
  const label = document.querySelector('.ctrl-fs-label');
  if (label) label.textContent = inFs ? '閉じる' : '拡大する';
}
document.addEventListener('fullscreenchange', onFsChange);
document.addEventListener('webkitfullscreenchange', onFsChange);
