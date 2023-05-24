const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const playlist = $('.playlist');
const cd = $('.cd');
const header2 = $('header h2')
const title = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const lineProgress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const PLAYER_STORAGE_KEY = 'F8-PLAYER'

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'MiMiMi',
            singer: 'Unknown',
            path: './music/[抖音-Tiktok] Dramma – МиМиМи (Mimimi) - Bài hát hot Tiktok.mp3',
            image: './image/1179209.png'
        },
        {
            name: 'Ae Wibu',
            singer: 'Unknown',
            path: './music/Anh em Wibu nghe bài....mp3',
            image: './image/1191544.jpg'
        },
        {
            name: 'Anime edit',
            singer: 'Unknown',
            path: './music/Anime edit (online-audio-converter.com).wav',
            image: './image/1197026.jpg'
        },
        {
            name: 'Anime edit other',
            singer: 'Unknown',
            path: './music/Anime edit.mp3',
            image: './image/1202332.jpg'
        },
        {
            name: 'Arcade',
            singer: 'Duncan Laurence',
            path: './music/Arcade - Duncan Laurence (Lyrics).mp3',
            image: './image/1216163.jpg'
        },
        {
            name: 'Autumn in my heart',
            singer: 'Unknown',
            path: './music/Autumn In My Heart.mp3',
            image: './image/1219674.jpg'
        }
    ],
    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Làm cd quay
        const cdThumbAnimation = title.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration : 10000,
            iterations: Infinity,
        })
        cdThumbAnimation.pause();

        // Chỉnh kích thước cd
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0;
            cd.style.opacity = newCdWidth/ cdWidth
        }

        // PLay/pause
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }

            audio.onplay = function () {
                _this.isPlaying = true;
                player.classList.add('playing')
                cdThumbAnimation.play();
            }
            audio.onpause = function () {
                _this.isPlaying = false;
                player.classList.remove('playing')
                cdThumbAnimation.pause();
            }
        }

        // time line progress
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime/ audio.duration * 100) 
                lineProgress.value = progressPercent
            }
        }

        lineProgress.onchange = function (e) {
            const seektime = audio.duration /   100 * e.target.value
            audio.currentTime = seektime
        }

        nextBtn.onclick = function() {
            if(_this.isRandom){
                _this.randomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        prevBtn.onclick = function() {
            if(_this.isRandom){
                _this.randomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }

        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
   
        }
        
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
            audio.play()
        }

        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
   
        }

        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')

            if(songNode || e.target.closest('.options')){
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }

                if(e.target.closet('.options')) {
                    
                }
        }}
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        },100)
    },

    loadCurrentSong: function() {
            header2.textContent = this.currentSong.name
            title.style.backgroundImage = `url('${this.currentSong.image}')`
            audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 1) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    randomSong: function() {
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length) 
        }while (newIndex === this.songs.length)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },



    start: function () {
        // 
        this.loadConfig()
        
        // Định nghĩa các thuộc tính coh object
        this.defineProperties()

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvent()

        this.loadCurrentSong()

        // Render playlist
        this.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }

}

app.start()