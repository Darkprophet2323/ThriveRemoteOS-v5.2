import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import './KDEMusicPlayer.css';

const YouTubeMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [isExpanded, setIsExpanded] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const playerRef = useRef(null);
  const timeUpdateInterval = useRef(null);

  // Get backend URL from environment
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Load initial playlist from backend
  useEffect(() => {
    loadPlaylist();
  }, []);

  // Time update interval
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      timeUpdateInterval.current = setInterval(() => {
        const player = playerRef.current;
        if (player && player.getCurrentTime) {
          const current = player.getCurrentTime();
          const total = player.getDuration();
          setCurrentTime(current);
          setDuration(total || 0);
        }
      }, 1000);
    } else {
      clearInterval(timeUpdateInterval.current);
    }

    return () => clearInterval(timeUpdateInterval.current);
  }, [isPlaying]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/music/playlist`);
      if (response.data.success) {
        setPlaylist(response.data.playlist);
        console.log('✅ Loaded YouTube playlist:', response.data.playlist);
      }
    } catch (error) {
      console.error('❌ Error loading playlist:', error);
      // Fallback playlist
      setPlaylist([
        {
          id: "dQw4w9WgXcQ",
          title: "Never Gonna Give You Up",
          artist: "Rick Astley",
          album: "Whenever You Need Somebody",
          duration: "3:33",
          cover: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          source: "YouTube"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async (query) => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await axios.post(`${BACKEND_URL}/api/music/search`, {
        query: query,
        max_results: 5
      });
      
      if (response.data.success) {
        setSearchResults(response.data.results);
        console.log('🔍 Search results:', response.data.results);
      }
    } catch (error) {
      console.error('❌ Error searching music:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addToPlaylist = (track) => {
    setPlaylist(prev => [...prev, track]);
    setSearchResults([]);
    setSearchQuery('');
  };

  // YouTube Player Event Handlers
  const onPlayerReady = (event) => {
    console.log('🎵 YouTube player ready');
    playerRef.current = event.target;
    setPlayerReady(true);
    
    // Set initial volume
    event.target.setVolume(volume * 100);
    
    // Get initial duration
    const duration = event.target.getDuration();
    setDuration(duration || 0);
  };

  const onPlayerStateChange = (event) => {
    const YT = window.YT;
    if (!YT) return;

    switch (event.data) {
      case YT.PlayerState.PLAYING:
        setIsPlaying(true);
        console.log('▶️ Playing:', playlist[currentTrack]?.title);
        break;
      case YT.PlayerState.PAUSED:
        setIsPlaying(false);
        console.log('⏸️ Paused');
        break;
      case YT.PlayerState.ENDED:
        console.log('⏹️ Track ended');
        handleNext();
        break;
      case YT.PlayerState.BUFFERING:
        console.log('⏳ Buffering...');
        break;
      default:
        break;
    }
  };

  const onPlayerError = (event) => {
    console.error('❌ YouTube player error:', event.data);
    handleNext(); // Skip to next track on error
  };

  // Player Controls
  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleNext = () => {
    if (repeatMode === 'one') {
      playerRef.current?.seekTo(0);
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
    
    if (nextTrack !== currentTrack) {
      setCurrentTrack(nextTrack);
      setCurrentTime(0);
    }
  };

  const handlePrevious = () => {
    const nextTrack = currentTrack - 1 < 0 ? playlist.length - 1 : currentTrack - 1;
    setCurrentTrack(nextTrack);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    if (!playerRef.current || !duration) return;
    
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume * 100);
    }
  };

  const handleTrackSelect = (index) => {
    setCurrentTrack(index);
    setCurrentTime(0);
  };

  const toggleRepeat = () => {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // YouTube Player Options
  const playerOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  const currentTrackData = playlist[currentTrack];

  if (loading) {
    return (
      <div className="kde-music-player loading">
        <div className="player-bar">
          <div className="track-info">
            <div className="loading-shimmer" style={{width: '48px', height: '48px', borderRadius: '6px'}}></div>
            <div className="track-details">
              <div className="loading-shimmer" style={{width: '120px', height: '14px', marginBottom: '4px'}}></div>
              <div className="loading-shimmer" style={{width: '80px', height: '12px'}}></div>
            </div>
          </div>
          <div className="loading-text">Loading YouTube Player...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`kde-music-player ${isExpanded ? 'expanded' : ''}`}>
      {/* Hidden YouTube Player */}
      {currentTrackData && (
        <div style={{ position: 'absolute', left: '-9999px' }}>
          <YouTube
            key={`${currentTrackData.id}-${currentTrack}`}
            videoId={currentTrackData.id}
            opts={playerOpts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            onError={onPlayerError}
          />
        </div>
      )}

      {/* Compact Player Bar */}
      <div className="player-bar">
        <div className="track-info">
          <div className="album-art">
            <img 
              src={currentTrackData?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'} 
              alt={currentTrackData?.title || 'No Track'} 
            />
            <div className="play-overlay" onClick={togglePlay}>
              <span className="material-icons-outlined">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </div>
          </div>
          
          <div className="track-details">
            <div className="track-title">{currentTrackData?.title || 'No Track Selected'}</div>
            <div className="track-artist">{currentTrackData?.artist || 'Unknown Artist'}</div>
          </div>
        </div>

        <div className="player-controls">
          <button className="control-btn" onClick={handlePrevious} disabled={playlist.length === 0}>
            <span className="material-icons-outlined">skip_previous</span>
          </button>
          
          <button className="play-btn" onClick={togglePlay} disabled={!playerReady || playlist.length === 0}>
            <span className="material-icons-outlined">
              {isPlaying ? 'pause_circle' : 'play_circle'}
            </span>
          </button>
          
          <button className="control-btn" onClick={handleNext} disabled={playlist.length === 0}>
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
            <h3>🎵 YouTube Music Player</h3>
            <button className="close-btn" onClick={() => setIsExpanded(false)}>
              <span className="material-icons-outlined">close</span>
            </button>
          </div>

          <div className="expanded-content">
            {/* Current Track Display */}
            <div className="current-track-display">
              <div className="large-album-art">
                <img 
                  src={currentTrackData?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'} 
                  alt={currentTrackData?.title || 'No Track'} 
                />
                <div className="track-source">{currentTrackData?.source || 'YouTube'}</div>
              </div>
              
              <div className="track-info-expanded">
                <h2 className="track-title-large">{currentTrackData?.title || 'No Track Selected'}</h2>
                <h3 className="track-artist-large">{currentTrackData?.artist || 'Unknown Artist'}</h3>
                <p className="track-album">{currentTrackData?.album || 'Unknown Album'}</p>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="player-controls-expanded">
              <div className="control-buttons">
                <button 
                  className={`control-btn ${isShuffling ? 'active' : ''}`}
                  onClick={() => setIsShuffling(!isShuffling)}
                >
                  <span className="material-icons-outlined">shuffle</span>
                </button>

                <button className="control-btn" onClick={handlePrevious} disabled={playlist.length === 0}>
                  <span className="material-icons-outlined">skip_previous</span>
                </button>
                
                <button className="play-btn-large" onClick={togglePlay} disabled={!playerReady || playlist.length === 0}>
                  <span className="material-icons-outlined">
                    {isPlaying ? 'pause_circle' : 'play_circle'}
                  </span>
                </button>
                
                <button className="control-btn" onClick={handleNext} disabled={playlist.length === 0}>
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

            {/* Music Search */}
            <div className="music-search">
              <h4>🔍 Add Music from YouTube</h4>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search for music on YouTube..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchMusic(searchQuery)}
                  className="search-input"
                />
                <button 
                  onClick={() => searchMusic(searchQuery)}
                  disabled={isSearching || !searchQuery.trim()}
                  className="search-button"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((track, index) => (
                    <div key={index} className="search-result-item">
                      <img src={track.cover} alt={track.title} className="result-thumbnail" />
                      <div className="result-info">
                        <div className="result-title">{track.title}</div>
                        <div className="result-artist">{track.artist}</div>
                      </div>
                      <button 
                        onClick={() => addToPlaylist(track)}
                        className="add-button"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Playlist */}
            <div className="playlist-section">
              <h4>Playlist ({playlist.length} tracks)</h4>
              <div className="playlist">
                {playlist.map((track, index) => (
                  <div 
                    key={`${track.id}-${index}`}
                    className={`playlist-item ${index === currentTrack ? 'active' : ''}`}
                    onClick={() => handleTrackSelect(index)}
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

export default YouTubeMusicPlayer;