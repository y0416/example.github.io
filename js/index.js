let play_pause=document.querySelector('.play-pause'),
    player_track=document.querySelector('.player-track') || null,
    album_cover=document.querySelector('.album-cover') || document.querySelector('.cover-card') || document.querySelector('.disc-center'),
    bg=document.querySelector('.bg'),
    album_name=document.querySelector('.album-name') || document.querySelector('.track-title'),
    track_name=document.querySelector('.track-name') || document.querySelector('.track-artist'),
    track_time=document.querySelector('.track-time') || null,
    current_time=document.querySelector('.current-time'),
    total_time=document.querySelector('.total-time'),
    // 新布局中使用 .progress-track
    progress_box=document.querySelector('.progress-track') || document.querySelector('.progress-box'),
    hover_time=document.querySelector('.hover-time') || null,
    hover_bar=document.querySelector('.hover-bar') || null,
    progress_bar=document.querySelector('.progress-bar'),
    play_prev=document.querySelector('.play-prev') || document.querySelector('.btn-prev'),
    play_next=document.querySelector('.play-next') || document.querySelector('.btn-next');

// 曲目结构数组：明确指定 mp3 与封面文件名以避免加载错误
let tracks = [
    { id: '좋아 (JOAH) (喜欢) (Re-Mastered)_H', artist: 'JAY Park', title: '좋아 (JOAH) (喜欢) (Re-Mastered)_H', mp3: '좋아 (JOAH) (喜欢) (Re-Mastered)_H.mp3', cover: '좋아 (JOAH) (喜欢) (Re-Mastered)_H.jpg' },
    { id: 'Yesterday', artist: 'JAY Park', title: 'Yesterday', mp3: 'Yesterday.mp3', cover: 'Yesterday.png' },
    { id: '몸매 (MOMMAE) (身姿) (Remix)', artist: 'JAY Park', title: '몸매 (MOMMAE) (身姿) (Remix)', mp3: '몸매 (MOMMAE) (身姿) (Remix).mp3', cover: '몸매 (MOMMAE) (身姿) (Remix).jpg' },
    { id: 'All_I_Wanna Do', artist: 'JAY Park', title: 'All_I_Wanna Do', mp3: 'All_I_Wanna Do.mp3', cover: 'All_I_Wanna Do.jpg' },
    { id: 'Like I Do (Jay Park Remix)', artist: 'JAY Park', title: 'Like I Do (Jay Park Remix)', mp3: 'Like I Do (Jay Park Remix).mp3', cover: 'Like I Do (Jay Park Remix).jpg' }
];

// 定义变量
let progress_t, //鼠标在进度条上悬停的位置
    progress_loc, //鼠标在进度条上悬停的音频位置
    c_m, //悬停音频位置(分钟)
    ct_minutes, //悬停播放位置(分)
    ct_seconds, //悬停播放位置(秒)
    cur_minutes, //当前播放时间(分)
    cur_seconds, //当前播放时间(秒)
    dur_minutes, //音频总时长(分)
    dur_seconds, //音频总时长(秒)
    play_progress; //播放进度
// 当前歌曲下标
let cur_index=-1;
// 初始化播放器：创建 audio，绑定事件，选中第一首
function initPlayer(){
    audio = new Audio();
    audio.loop = false;

    // 选中并加载第一首曲目
    selectTrack(0);

    if(play_pause) play_pause.addEventListener('click', playPause);

    if(progress_box){
        if(typeof showHover === 'function' && hover_bar) progress_box.addEventListener('mousemove', showHover);
        if(typeof hideHover === 'function' && hover_bar) progress_box.addEventListener('mouseout', hideHover);
        progress_box.addEventListener('click', function(){ if(typeof playFromClickedPos === 'function') playFromClickedPos(); });
    }

    audio.addEventListener('timeupdate', updateCurTime);
    if(play_prev) play_prev.addEventListener('click', function(){ selectTrack(-1); });
    if(play_next) play_next.addEventListener('click', function(){ selectTrack(1); });
}

// 播放暂停
function playPause(){
    setTimeout(function(){
        if(audio.paused){
            if(player_track) player_track.classList.add('active');
            if(play_pause && play_pause.querySelector('.fa')) play_pause.querySelector('.fa').className='fa fa-pause';
            if(album_cover && album_cover.classList) album_cover.classList.add('active');
            audio.play();
        }else{
            if(player_track) player_track.classList.remove('active');
            if(play_pause && play_pause.querySelector('.fa')) play_pause.querySelector('.fa').className='fa fa-play';
            if(album_cover && album_cover.classList) album_cover.classList.remove('active');
            audio.pause();
        }
    },300);
}

// 显示悬停播放位置弹层
function showHover(e){
    // 计算鼠标在进度条上的悬停位置(当前鼠标的X坐标-进度条在窗口中的left位置)
    progress_t=e.clientX - progress_box.getBoundingClientRect().left;
    // 计算鼠标在进度条上悬停时的音频位置
    // audio.duration 音频总时长
    progress_loc=audio.duration * (progress_t / progress_box.getBoundingClientRect().width);
    // 设置悬停进度条的宽度(较深部分)
    hover_bar.style.width=progress_t+'px';
    // 将悬停音频位置转为分钟
    c_m=progress_loc / 60;
    ct_minutes=Math.floor(c_m); //分
    ct_seconds=Math.floor(progress_loc - ct_minutes * 60); //秒

    if(ct_minutes<10){
        ct_minutes='0'+ct_minutes;
    }
    if(ct_seconds<10){
        ct_seconds='0'+ct_seconds;
    }
    if(isNaN(ct_minutes) || isNaN(ct_seconds)){
        hover_time.innerText='--:--';
    }else{
        hover_time.innerText=ct_minutes+':'+ct_seconds;
    }

    // 设置悬停播放位置弹层的位置并显示
    hover_time.style.left=progress_t+'px';
    hover_time.style.marginLeft='-20px';
    hover_time.style.display='block';
}

// 隐藏悬停播放位置弹层
function hideHover(){
    hover_bar.style.width='0px';
    hover_time.innerText='00:00';
    hover_time.style.left='0px';
    hover_time.style.marginLeft='0px';
    hover_time.style.display='none';
}

// 从点击的位置开始播放
function playFromClickedPos(){
    // 设置当前播放时间
    audio.currentTime=progress_loc;
    // 设置进度条宽度
    progress_bar.style.width=progress_t+'px';
    // 隐藏悬停播放位置弹层
    hideHover();
}

// 改变当前播放时间
function updateCurTime(){
    // 当前播放时间(分)
    cur_minutes=Math.floor(audio.currentTime / 60);
    // 当前播放时间(秒)
    cur_seconds=Math.floor(audio.currentTime - cur_minutes * 60);
    // 音频总时长(分)
    dur_minutes=Math.floor(audio.duration / 60);
    // 音频总时长(秒)
    dur_seconds=Math.floor(audio.duration - dur_minutes * 60);
    // 计算播放进度
    play_progress=audio.currentTime / audio.duration * 100;

    if(cur_minutes<10){
        cur_minutes='0'+cur_minutes;
    }
    if(cur_seconds<10){
        cur_seconds='0'+cur_seconds;
    }
    if(dur_minutes<10){
        dur_minutes='0'+dur_minutes;
    }
    if(dur_seconds<10){
        dur_seconds='0'+dur_seconds;
    }

    // 设置播放时间
    if(isNaN(cur_minutes) || isNaN(cur_seconds)){
        current_time.innerText='00:00';
    }else{
        current_time.innerText=cur_minutes+':'+cur_seconds;
    }
    // 设置总时长
    if(isNaN(dur_minutes) || isNaN(dur_seconds)){
        total_time.innerText='00:00';
    }else{
        total_time.innerText=dur_minutes+':'+dur_seconds;
    }
    // 设置进度条宽度
    progress_bar.style.width=play_progress+'%';

    // 播放完毕, 恢复样式
    if(play_progress==100){
    if(play_pause && play_pause.querySelector('.fa')) play_pause.querySelector('.fa').className='fa fa-play';
        progress_bar.style.width='0px';
        current_time.innerText='00:00';
        if(player_track) player_track.classList.remove('active');
        if(album_cover && album_cover.classList) album_cover.classList.remove('active');
    }
}

// 切换歌曲(flag: 0=初始, 1=下一首, -1=上一首)
function selectTrack(flag){
    if(flag==0 || flag==1){
        ++cur_index;
    }else{
        --cur_index;
    }

    if(cur_index>-1 && cur_index<tracks.length){
        console.log('selectTrack called', {flag, cur_index});
        progress_bar.style.width='0px';
        current_time.innerText='00:00';
        total_time.innerText='00:00';
        // 当前专辑名
        let curTrack = tracks[cur_index];
        let cur_album = curTrack.id;
        // 当前歌曲信息(歌手 - 歌名)
        let cur_track_name = (curTrack.artist? (curTrack.artist + ' - ') : '') + curTrack.title;

        // 先设置文本和封面，避免后续 DOM 操作抛错导致文字未写入
        try{
            if(album_name) album_name.innerText=cur_album;
            if(track_name) track_name.innerText=cur_track_name;

            // 强制写入页面上的标题/歌手（优先使用 .track-title / .track-artist）
            const titleEl = document.querySelector('.track-title');
            const artistEl = document.querySelector('.track-artist');
            if(titleEl || artistEl){
                const parts = cur_track_name.split(' - ');
                const artist = parts.length>1? parts[0] : '';
                const song = parts.length>1? parts.slice(1).join(' - ') : cur_track_name;
                if(titleEl) { titleEl.textContent = song; titleEl.style.visibility = 'visible'; }
                if(artistEl) { artistEl.textContent = artist; artistEl.style.visibility = 'visible'; }
            }

            // 设置封面（使用 tracks 中的 cover 字段优先）
            const coverImgEl = document.querySelector('.cover-img');
            if(curTrack.cover){
                const coverUrl = './images/cover/' + curTrack.cover;
                if(coverImgEl) coverImgEl.src = coverUrl;
                if(bg) bg.style.backgroundImage = 'url(' + coverUrl + ')';
            }else{
                // 回退到尝试多种扩展名
                trySetCover(cur_album);
            }
        }catch(e){
            console.warn('设置标题/封面时发生错误', e);
        }

        // 设置音频路径（使用 tracks 中的 mp3 字段）
        if(curTrack.mp3){
            audio.src = './mp3/' + curTrack.mp3;
        }else{
            audio.src = './mp3/' + cur_album + '.mp3';
        }
        if(flag!=0){
            // 当切换上一首,下一首时,自动播放
            audio.play();
            if(player_track) player_track.classList.add('active');
            if(album_cover && album_cover.classList) album_cover.classList.add('active');
        }

        // 切换时根据 flag 调整转盘外圈大小：初始不加类，点击切换（flag != 0）时加大外圈
        try{
            const discEl = document.querySelector('.disc');
            if(discEl){
                if(flag !== 0) discEl.classList.add('ring-large');
                else discEl.classList.remove('ring-large');
            }
        }catch(e){console.warn('调整 disc 大小时出错', e);} 

        // 设置播放图标（放在最后，且增加存在性检查）
        try{
            if(play_pause && play_pause.querySelector('.fa')){
                if(flag==0){ play_pause.querySelector('.fa').className='fa fa-play'; }
                else { play_pause.querySelector('.fa').className='fa fa-pause'; }
            }
        }catch(e){ console.warn('设置播放图标失败', e); }

        // 最后再次强制写入标题/歌手，避免被其他逻辑覆盖
        try{
            const finalTitle = document.querySelector('.track-title');
            const finalArtist = document.querySelector('.track-artist');
            if(finalTitle || finalArtist){
                const parts = cur_track_name.split(' - ');
                const artist = parts.length>1? parts[0] : '';
                const song = parts.length>1? parts.slice(1).join(' - ') : cur_track_name;
                if(finalTitle) {
                    finalTitle.textContent = song;
                    finalTitle.style.visibility = 'visible';
                    finalTitle.style.color = 'rgba(255,255,255,0.95)';
                    console.log('finalTitle set ->', finalTitle.textContent);
                }
                if(finalArtist) {
                    finalArtist.textContent = artist;
                    finalArtist.style.visibility = 'visible';
                    finalArtist.style.color = 'rgba(255,255,255,0.75)';
                    console.log('finalArtist set ->', finalArtist.textContent);
                }
            }
        }catch(e){ console.warn('最终写入标题/歌手失败', e); }
        // 调试：打印最终元素的计算样式与位置
        try{
            const dbgEl = document.querySelector('.track-title');
            if(dbgEl){
                const cs = window.getComputedStyle(dbgEl);
                console.log('DEBUG track-title computed:', {display: cs.display, visibility: cs.visibility, color: cs.color, opacity: cs.opacity});
                const rect = dbgEl.getBoundingClientRect();
                console.log('DEBUG track-title rect:', rect);
            }
        }catch(err){ console.warn('DEBUG read failed', err); }

        console.log('selectTrack finished', {cur_index, cur_album, cur_track_name});
    }else{
        // 切换溢出专辑数组时, 恢复cur_index
        if(flag==0 || flag==1){
            --cur_index;
        }else{
            ++cur_index;
        }
    }
}

// 初始化播放器
initPlayer();

// 尝试加载封面图片的辅助函数：尝试多种扩展并回退到可用图片
function trySetCover(baseName){
    if(!baseName) return;
    const folder = './images/cover/';
    const exts = ['',' .jpg','.jpg','.png','.jpeg'];
    // 清理：去掉意外的空格拼写项
    const candidates = [];
    // 如果 baseName 已经包含扩展名，先尝试原样
    const hasExt = /\.[a-zA-Z0-9]{2,4}$/.test(baseName);
    if(hasExt) candidates.push(baseName);
    // 直接尝试常见扩展
    ['.jpg','.png','.jpeg'].forEach(e=>{ if(!hasExt) candidates.push(baseName+e); });
    // 尝试 URL 编码版本
    try{ const enc = encodeURIComponent(baseName); if(enc!==baseName){ if(hasExt) candidates.push(enc); else ['.jpg','.png','.jpeg'].forEach(e=>candidates.push(enc+e)); } }catch(e){}

    // 最后，尝试一些常见备用名（数字或第一张）
    // 添加 repository 中已知备选名
    const fallbacks = ['1.jpg','2.jpg'];

    // 顺序尝试 candidates，然后 fallbacks
    const tryList = candidates.concat(fallbacks);

    function tryNext(i){
        if(i>=tryList.length){
            console.warn('未找到匹配的封面：', baseName);
            return;
        }
        const name = tryList[i].trim();
        const url = folder + name;
        const img = new Image();
        img.onload = function(){
            // 找到可用图片，设置封面与背景
            const coverEl = document.querySelector('.cover-img') || document.querySelector('.disc-center img');
            if(coverEl) coverEl.src = url;
            if(bg) bg.style.backgroundImage = 'url('+url+')';
        };
        img.onerror = function(){
            tryNext(i+1);
        };
        img.src = url;
    }
    tryNext(0);
}