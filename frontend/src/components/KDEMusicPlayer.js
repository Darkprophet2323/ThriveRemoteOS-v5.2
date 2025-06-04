import React, { useState, useEffect, useRef } from 'react';
import './KDEMusicPlayer.css';

const KDEMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);

  // Free music tracks from various sources
  const playlist = [
    {
      id: 1,
      title: "Ambient Space",
      artist: "Kevin MacLeod",
      album: "Royalty Free",
      duration: "3:42",
      src: "https://www.soundjay.com/misc/sounds/beep-24.wav", // Placeholder - would use real free music URLs
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      source: "Free Music Archive"
    },
    {
      id: 2, 
      title: "Digital Dreams",
      artist: "AudioNautix",
      album: "Synthwave Collection",
      duration: "4:15",
      src: "https://www.soundjay.com/misc/sounds/beep-25.wav", // Placeholder
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      source: "AudioNautix"
    },
    {
      id: 3,
      title: "Neo Tokyo",
      artist: "Jamendo Artist",
      album: "Cyberpunk Vibes",
      duration: "5:23",
      src: "https://www.soundjay.com/misc/sounds/beep-26.wav", // Placeholder
      cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop",
      source: "Jamendo"
    },
    {
      id: 4,
      title: "Quantum Flow",
      artist: "SoundCloud Creative",
      album: "Electronic Essence",
      duration: "3:58",
      src: "https://www.soundjay.com/misc/sounds/beep-27.wav", // Placeholder
      cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop",
      source: "SoundCloud"
    },
    {
      id: 5,
      title: "Neural Network",
      artist: "Free Music Project",
      album: "AI Soundscapes",
      duration: "6:12",
      src: "https://www.soundjay.com/misc/sounds/beep-28.wav", // Placeholder
      cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
      source: "Free Music Archive"
    }
  ];

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => handleNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack]);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && playlist[currentTrack]) {
      audio.src = playlist[currentTrack].src;
      audio.volume = volume;
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    }
  }, [currentTrack, volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      if (isPlaying) audioRef.current.play();
      return;
    }

    let nextTrack;
    if (isShuffling) {
      nextTrack = Math.floor(Math.random() * playlist.length);
    } else {
      nextTrack = currentTrack + 1;
      if (nextTrack >= playlist.length) {
        nextTrack = repeatMode === 'all' ? 0 : currentTrack;
      }
    }
    
    setCurrentTrack(nextTrack);
  };

  const handlePrevious = () => {
    const nextTrack = currentTrack - 1 < 0 ? playlist.length - 1 : currentTrack - 1;
    setCurrentTrack(nextTrack);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleRepeat = () => {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const track = playlist[currentTrack] || {};

  return (
    <div className={`kde-music-player ${isExpanded ? 'expanded' : ''}`}>
      <audio ref={audioRef} />
      
      {/* Compact Player Bar */}
      <div className="player-bar">
        <div className="track-info">
          <div className="album-art">
            <img src={track.cover} alt={track.title} />
            <div className="play-overlay" onClick={togglePlay}>
              <span className="material-icons-outlined">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </div>
          </div>
          
          <div className="track-details">
            <div className="track-title">{track.title}</div>
            <div className="track-artist">{track.artist}</div>
          </div>
        </div>

        <div className="player-controls">
          <button className="control-btn" onClick={handlePrevious}>
            <span className="material-icons-outlined">skip_previous</span>
          </button>
          
          <button className="play-btn" onClick={togglePlay}>
            <span className="material-icons-outlined">
              {isPlaying ? 'pause_circle' : 'play_circle'}
            </span>
          </button>
          
          <button className="control-btn" onClick={handleNext}>
            <span className="material-icons-outlined">skip_next</span>
          </button>
        </div>

        <div className="player-extras">
          <div className="progress-section">
            <span className="time-current">{formatTime(currentTime)}</span>
            <div className="progress-bar" onClick={handleSeek}>
              <div 
                className="progress-fill"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="time-total">{formatTime(duration)}</span>
          </div>

          <div className="volume-section">
            <span className="material-icons-outlined">volume_up</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>

          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="material-icons-outlined">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Player */}
      {isExpanded && (
        <div className="expanded-player">
          <div className="player-header">
            <h3>Now Playing</h3>
            <button className="close-btn" onClick={() => setIsExpanded(false)}>
              <span className="material-icons-outlined">close</span>
            </button>
          </div>

          <div className="expanded-content">
            <div className="current-track-display">
              <div className="large-album-art">
                <img src={track.cover} alt={track.title} />
                <div className="track-source">{track.source}</div>
              </div>
              
              <div className="track-info-expanded">
                <h2 className="track-title-large">{track.title}</h2>
                <h3 className="track-artist-large">{track.artist}</h3>
                <p className="track-album">{track.album}</p>
              </div>
            </div>

            <div className="player-controls-expanded">
              <div className="control-buttons">
                <button 
                  className={`control-btn ${isShuffling ? 'active' : ''}`}
                  onClick={() => setIsShuffling(!isShuffling)}
                >
                  <span className="material-icons-outlined">shuffle</span>
                </button>

                <button className="control-btn" onClick={handlePrevious}>
                  <span className="material-icons-outlined">skip_previous</span>
                </button>
                
                <button className="play-btn-large" onClick={togglePlay}>
                  <span className="material-icons-outlined">
                    {isPlaying ? 'pause_circle' : 'play_circle'}
                  </span>
                </button>
                
                <button className="control-btn" onClick={handleNext}>
                  <span className="material-icons-outlined">skip_next</span>
                </button>

                <button 
                  className={`control-btn ${repeatMode !== 'none' ? 'active' : ''}`}
                  onClick={toggleRepeat}
                >
                  <span className="material-icons-outlined">
                    {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
                  </span>
                </button>
              </div>

              <div className="progress-section-expanded">
                <span className="time-current">{formatTime(currentTime)}</span>
                <div className="progress-bar-expanded" onClick={handleSeek}>
                  <div 
                    className="progress-fill"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="time-total">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playlist */}
            <div className="playlist-section">
              <h4>Playlist</h4>
              <div className="playlist">
                {playlist.map((track, index) => (
                  <div 
                    key={track.id}
                    className={`playlist-item ${index === currentTrack ? 'active' : ''}`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    <div className="playlist-item-art">
                      <img src={track.cover} alt={track.title} />
                    </div>
                    <div className="playlist-item-info">
                      <div className="playlist-item-title">{track.title}</div>
                      <div className="playlist-item-artist">{track.artist}</div>
                    </div>
                    <div className="playlist-item-duration">{track.duration}</div>
                    <div className="playlist-item-source">{track.source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KDEMusicPlayer;