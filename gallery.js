const videos = document.querySelectorAll('video');

const muteToggleGroup    = document.getElementById('audio-toggle');

const audioTxt = document.getElementById('audio-txt');

const mutedIcon          = document.getElementById('muted');
const mutedToggleIcon    = document.getElementById('muted-toggle');
const unmutedIcon        = document.getElementById('unmuted');
const unmutedToggleIcon  = document.getElementById('unmuted-toggle');

const mutedDynamicIcon   = document.getElementById('muted-dynamic');
const unmutedDynamicIcon = document.getElementById('unmuted-dynamic');

const playDynamicIcon = document.getElementById('play');

const upIcon = document.getElementById('up');

var muted = true;
var audioSource = document.querySelector('.audio > video');

function updateAudioIcons() {
    const stateIcon = muted ? mutedIcon : unmutedIcon;
    const otherIcon = muted ? unmutedIcon : mutedIcon;
    otherIcon.style.opacity = 0;
    stateIcon.style.opacity = 1;

    mutedToggleIcon.style.opacity = 0;
    unmutedToggleIcon.style.opacity = 0;

    if (audioSource) muteToggleGroup.style.opacity = 1;
    else             muteToggleGroup.style.opacity = 0.5;
}

function toggleMute() {
    muted = !muted;
    if (muted) videos.forEach((video) => video.muted = true);
    else if (audioSource) audioSource.muted = muted;
    updateAudioIcons();
}

muteToggleGroup.addEventListener('click', toggleMute);
muteToggleGroup.addEventListener('mouseenter', () => {
    if (muted) {
        mutedIcon.style.opacity = 0;
        mutedToggleIcon.style.opacity = 1;
    } else {
        unmutedIcon.style.opacity = 0;
        unmutedToggleIcon.style.opacity = 1;
    }
});
muteToggleGroup.addEventListener('mouseleave', () => {
    if (muted) {
        mutedIcon.style.opacity = 1;
        mutedToggleIcon.style.opacity = 0;
    } else {
        unmutedIcon.style.opacity = 1;
        unmutedToggleIcon.style.opacity = 0;
    }
    // audioTxt.style.opacity = 0;
    // audioTxt.style.pointerEvents = 'none';
});

const audioSourceExit = new IntersectionObserver(entries => {
    for (const entry of entries) {
        const video = entry.target;
        if (!entry.isIntersecting && video === audioSource) {
            if (video.parentElement.classList.contains('background') && !video.muted) return;
            video.muted = true;
            audioSource = null;
            updateAudioIcons();
        }
    }
}, {
    delay: 50,
    threshold: 0,
});

const audioSourceEnter = new IntersectionObserver(entries => {
    for (const entry of entries) {
        const video = entry.target;
        if (entry.isIntersecting) {
            if (video.readyState < 4) return;
            if (audioSource === video) return;
            if (audioSource) audioSource.muted = true;
            audioSource = video;
            audioSource.muted = muted;
            updateAudioIcons();
        }
    }
}, {
    delay: 50,
    threshold: 1,
});

document.querySelectorAll('.video-container').forEach((container) => {
    const video = container.querySelector('video');

    const playControl   = container.querySelector('.control.play');
    const muteControl   = container.querySelector('.control.mute');
    const unmuteControl = container.querySelector('.control.unmute');
    // muteControl.style.opacity = 0;
    // unmuteControl.style.opacity = 0;

    const audio      = container.classList.contains('audio');
    const background = container.classList.contains('background');

    if (audio) {
        audioSourceEnter.observe(video)
        audioSourceExit.observe(video)
        video.style.cursor = 'pointer';
    }

    var hover = false;
    function updateControlIcons() {
        playControl.style.opacity = 0;
        muteControl.style.opacity = 0;
        unmuteControl.style.opacity = 0;

        if (video.paused) {
            playControl.style.opacity = 1;
            video.style.cursor = 'pointer';
        } else if (audio) {
            if (hover) {
                if (video.muted) unmuteControl.style.opacity = 1;
                else             muteControl.style.opacity   = 1;
            }
        } else {
            video.style.cursor = 'default';
        }
    }

    video.addEventListener('click', () => {
        if (video.paused) {
            video.play();
        } else if (audio) {
            if (video.muted) {
                if (audioSource && audioSource !== video) audioSource.muted = true;
                video.muted = false;
                muted = false;
                audioSource = video;
            } else {
                video.muted = true;
                muted = true;
            }
            updateAudioIcons();
        }
    });
    video.addEventListener('volumechange', () => { updateControlIcons(); });
    video.addEventListener('pause',        () => { updateControlIcons(); });
    video.addEventListener('play',         () => { updateControlIcons(); });
    video.addEventListener('mouseenter', () => {
        hover = true;
        updateControlIcons();
    });
    video.addEventListener('mouseleave', () => {
        hover = false;
        updateControlIcons();
    });
    updateControlIcons();
})

var unmuteAtTop = false;

// up icon opacity
window.addEventListener('scroll', () => {
    const scroll = window.scrollY / window.innerHeight;
    upIcon.style.opacity = Math.min(1, scroll);
    upIcon.style.pointerEvents = scroll > .5 ? 'auto' : 'none';

    audioTxt.style.opacity = Math.max(0, 1 - window.scrollY / (audioTxt.offsetTop + audioTxt.offsetHeight));

    if (unmuteAtTop && window.scrollY < 1) {
        unmuteAtTop = false;
        toggleMute();
    }
    // if (scroll >= 1) {
    //     audioTxt.style.opacity = 0;
    //     audioTxt.style.pointerEvents = 'none';
    // }
});

upIcon.addEventListener('click', () => {
    if (!muted && window.scrollY > window.innerHeight / 2 && !audioSource.parentElement.classList.contains('background')) {
        toggleMute();
        unmuteAtTop = true;
    }
    window.scroll(window.scrollX, 0);
})

updateAudioIcons();
