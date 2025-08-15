// app/videos/[id].tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import * as ScreenOrientation from 'expo-screen-orientation';

import useFetch from '@/services/useFetch';
import { fetchMovieVideos } from '@/services/api';

function pickBestYouTubeKey(list: MovieVideos[] = []): string | null {
  const yt = list.filter((v) => v.site === 'YouTube');
  if (!yt.length) return null;
  const cand = yt
    .filter((v) => ['Trailer', 'Teaser', 'Clip'].includes(v.type))
    .sort(
      (a, b) =>
        (new Date(b.published_at ?? 0).getTime() || 0) -
        (new Date(a.published_at ?? 0).getTime() || 0)
    );
  return (
    cand.find((v) => v.type === 'Trailer' && v.official)?.key ??
    cand[0]?.key ??
    yt[0]?.key ??
    null
  );
}

export default function VideoPlayerPage() {
  const params = useLocalSearchParams<{ id?: string | string[]; autoplay?: string }>();
  const movieId = Array.isArray(params.id) ? params.id[0] : params.id;
  const shouldAutoplay = true;

  const { width, height } = useWindowDimensions();
  const [playing, setPlaying] = useState(!!shouldAutoplay);
  const playerRef = useRef<YoutubeIframeRef | null>(null);

  // Lock landscape + hide status bar saat screen aktif
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } catch {}
        if (mounted) StatusBar.setHidden(true, 'fade');
      })();

      return () => {
        mounted = false;
        // Kembalikan ke default
        ScreenOrientation.unlockAsync().catch(() => {});
        StatusBar.setHidden(false, 'fade');
      };
    }, [])
  );

  const { data: videos, loading, error } = useFetch<MovieVideos[]>(() => {
    if (!movieId) return Promise.resolve([] as MovieVideos[]);
    return fetchMovieVideos(movieId);
  });

  const videoId = useMemo(() => pickBestYouTubeKey(videos ?? undefined), [videos]);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
      Alert.alert('Video has ended!');
    }
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {!movieId && <Text style={styles.error}>Movie ID tidak valid.</Text>}
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {error && <Text style={styles.error}>Gagal memuat video.</Text>}

      {videoId ? (
        <YoutubePlayer
          key={videoId} // re-mount jika video berubah
          ref={playerRef}
          // Isi layar penuh
          height={height}
          width={width}
          play={true}
          videoId={videoId}
          onChangeState={onStateChange}
          forceAndroidAutoplay={true}
          onReady={() => {
            // memastikan autoplay state sinkron
            setPlaying(true);
          }}
          // onError={(e) => console.warn('YouTube error:', e)}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            rel: false,
            preventFullScreen:true
          }}
          webViewProps={{
            allowsFullscreenVideo: true,
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
      ) : (
        !loading && movieId && <Text style={styles.status}>Tidak ada trailer YouTube.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'black' },
  status: { color: '#ddd', textAlign: 'center', marginTop: 12 },
  error: { color: '#ff6b6b', textAlign: 'center', marginTop: 12 },
});
