#!/usr/bin/env python3
"""
YouTube Music Service for ThriveRemoteOS
Provides YouTube integration for the KDE Music Player
"""

import os
import json
import asyncio
import logging
from typing import List, Dict, Optional
import yt_dlp
import requests
from urllib.parse import urlparse, parse_qs

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YouTubeService:
    def __init__(self):
        self.ydl_opts = {
            'format': 'bestaudio/best',
            'extractaudio': True,
            'audioformat': 'mp3',
            'noplaylist': True,
            'quiet': True,
            'no_warnings': True,
        }
        
        # Curated YouTube music playlist for the KDE player
        self.curated_tracks = [
            {
                "id": "dQw4w9WgXcQ",
                "title": "Never Gonna Give You Up",
                "artist": "Rick Astley",
                "album": "Whenever You Need Somebody",
                "duration": "3:33",
                "cover": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
                "source": "YouTube"
            },
            {
                "id": "kJQP7kiw5Fk",
                "title": "Despacito",
                "artist": "Luis Fonsi ft. Daddy Yankee",
                "album": "Vida",
                "duration": "4:42",
                "cover": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
                "source": "YouTube"
            },
            {
                "id": "YQHsXMglC9A",
                "title": "Hello",
                "artist": "Adele",
                "album": "25",
                "duration": "6:07",
                "cover": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop",
                "source": "YouTube"
            },
            {
                "id": "9bZkp7q19f0",
                "title": "Gangnam Style",
                "artist": "PSY",
                "album": "Psy 6 (Six Rules), Part 1",
                "duration": "4:13",
                "cover": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop",
                "source": "YouTube"
            },
            {
                "id": "L_jWHffIx5E",
                "title": "Smells Like Teen Spirit",
                "artist": "Nirvana",
                "album": "Nevermind",
                "duration": "5:01",
                "cover": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
                "source": "YouTube"
            }
        ]
    
    def get_video_id_from_url(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL"""
        try:
            parsed_url = urlparse(url)
            if parsed_url.hostname in ['www.youtube.com', 'youtube.com']:
                return parse_qs(parsed_url.query)['v'][0]
            elif parsed_url.hostname in ['youtu.be']:
                return parsed_url.path[1:]
            return None
        except:
            return None
    
    def get_video_info(self, video_id: str) -> Optional[Dict]:
        """Get video information using yt-dlp"""
        try:
            url = f"https://www.youtube.com/watch?v={video_id}"
            
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                return {
                    "id": video_id,
                    "title": info.get('title', 'Unknown Title'),
                    "artist": info.get('uploader', 'Unknown Artist'),
                    "duration": self._format_duration(info.get('duration', 0)),
                    "thumbnail": info.get('thumbnail', ''),
                    "url": url,
                    "audio_url": info.get('url', ''),
                    "source": "YouTube"
                }
        except Exception as e:
            logger.error(f"Error extracting video info: {e}")
            return None
    
    def _format_duration(self, seconds: int) -> str:
        """Convert seconds to MM:SS format"""
        if not seconds:
            return "0:00"
        
        minutes = seconds // 60
        seconds = seconds % 60
        return f"{minutes}:{seconds:02d}"
    
    def search_youtube(self, query: str, max_results: int = 5) -> List[Dict]:
        """Search YouTube for music tracks"""
        try:
            search_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': True,
                'default_search': 'ytsearch5:',
            }
            
            with yt_dlp.YoutubeDL(search_opts) as ydl:
                search_results = ydl.extract_info(
                    f"ytsearch{max_results}:{query} music",
                    download=False
                )
                
                tracks = []
                for entry in search_results.get('entries', []):
                    if entry:
                        tracks.append({
                            "id": entry.get('id', ''),
                            "title": entry.get('title', 'Unknown Title'),
                            "artist": entry.get('uploader', 'Unknown Artist'),
                            "duration": self._format_duration(entry.get('duration', 0)),
                            "cover": f"https://img.youtube.com/vi/{entry.get('id', '')}/hqdefault.jpg",
                            "source": "YouTube Search"
                        })
                
                return tracks
                
        except Exception as e:
            logger.error(f"Error searching YouTube: {e}")
            return []
    
    def get_curated_playlist(self) -> List[Dict]:
        """Get the curated playlist for the KDE Music Player"""
        return self.curated_tracks
    
    def get_trending_music(self) -> List[Dict]:
        """Get trending music from YouTube"""
        try:
            # Use a curated list of trending music video IDs
            trending_ids = [
                "dQw4w9WgXcQ",  # Rick Roll (classic)
                "kJQP7kiw5Fk",  # Despacito
                "YQHsXMglC9A",  # Hello - Adele
                "9bZkp7q19f0",  # Gangnam Style
                "L_jWHffIx5E"   # Smells Like Teen Spirit
            ]
            
            trending_tracks = []
            for video_id in trending_ids:
                track_info = self.get_video_info(video_id)
                if track_info:
                    trending_tracks.append(track_info)
            
            return trending_tracks
            
        except Exception as e:
            logger.error(f"Error getting trending music: {e}")
            return self.curated_tracks  # Fallback to curated playlist
    
    def get_music_recommendations(self, based_on_id: str) -> List[Dict]:
        """Get music recommendations based on a video ID"""
        try:
            # For demo purposes, return curated tracks
            # In a real implementation, you'd use YouTube's API or related videos
            return self.curated_tracks
        except Exception as e:
            logger.error(f"Error getting recommendations: {e}")
            return []
    
    def validate_youtube_url(self, url: str) -> bool:
        """Validate if URL is a valid YouTube URL"""
        try:
            video_id = self.get_video_id_from_url(url)
            return video_id is not None
        except:
            return False
    
    async def download_audio_async(self, video_id: str, output_path: str) -> bool:
        """Download audio asynchronously (for offline playback)"""
        try:
            url = f"https://www.youtube.com/watch?v={video_id}"
            
            download_opts = {
                'format': 'bestaudio/best',
                'outtmpl': f'{output_path}/%(title)s.%(ext)s',
                'extractaudio': True,
                'audioformat': 'mp3',
                'noplaylist': True,
            }
            
            with yt_dlp.YoutubeDL(download_opts) as ydl:
                ydl.download([url])
            
            return True
            
        except Exception as e:
            logger.error(f"Error downloading audio: {e}")
            return False

# Initialize YouTube service
youtube_service = YouTubeService()

def get_youtube_service() -> YouTubeService:
    """Get the YouTube service instance"""
    return youtube_service
