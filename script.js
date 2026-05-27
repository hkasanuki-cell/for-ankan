// ---------- サイドパネルのタブ切替 ----------
const tabChapters = document.getElementById('tabChapters');
const tabChat = document.getElementById('tabChat');
const paneChapters = document.getElementById('paneChapters');
const paneChat = document.getElementById('paneChat');

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
tabChat.addEventListener('click', () => selectPanel('chat'));

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
  });
});

// ---------- 再生／一時停止トグル（UIのみ） ----------
const player = document.getElementById('videoPlayer');
const playBtn = document.getElementById('playBtn');
const playOverlay = document.getElementById('playOverlay');
const iconPlay = playBtn.querySelector('.icon-play');
const iconPause = playBtn.querySelector('.icon-pause');

function togglePlay() {
  const playing = player.classList.toggle('is-playing');
  iconPlay.hidden = playing;
  iconPause.hidden = !playing;
}
playBtn.addEventListener('click', togglePlay);
playOverlay.addEventListener('click', togglePlay);

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
