import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import useFetch from '@/services/useFetch';
import { fetchMovieDetails } from '@/services/api';
import { icons } from '@/constants/icons';
import { formatMinutesToHM } from '@/utils/time';

interface MovieInfoProps {
  label: string;
  value?: string | number | null
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className='flex-col items-start justify-center mt-5'>
    <Text className='text-light-200 font-normal text-sm'>{label}</Text>
    <Text className='text-light-100 text-sm font-bold mt-2'>{value || 'N/A'}</Text>
  </View>
)

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: movie, loading } = useFetch(() => {
    return fetchMovieDetails(id as string)
  })
  return (
    <View className='bg-primary flex-1'>
      <ScrollView contentContainerStyle={{
        paddingBottom: 80
      }}>
        <View className='relative'>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}` }}
            className='w-full h-[550px]'
            resizeMode='cover' // cover agar proporsional
          />

          {/* Outer ring (putih) + shadow */}
          <TouchableOpacity
            // onPress={onPlay}
            // activeOpacity={0.9}
            onPress={()=>{
              router.push({pathname:'/videos/[id]',params:{id:String(movie?.id),autoplay: '1'}})
            }}
            className='absolute -bottom-8 right-5 z-20 rounded-full'
            style={{
              // shadow iOS
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              // elevation Android
              elevation: 10,
            }}
          >
            {/* Ring putih */}
            <View className='bg-white p-2 rounded-full'>
              {/* Tombol lingkaran utama */}
              <View className='p-3 rounded-full items-center justify-center'>
                <Image source={icons.play} className='w-6 h-6' resizeMode='contain' />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View className='flex-col items-start justify-center mt-5 px-5'>
          <Text className='text-white font-bold text-xl'>{movie?.title}</Text>
          <View className='flex-row items-center gap-x-1 mt-2'>
            <Text className='text-light-200'>{movie?.release_date?.split('-')[0]}</Text>
            <Text className='text-light-200 font-bold'>•</Text>
            <Text className='text-light-200 text-sm'>{formatMinutesToHM(movie?.runtime)}</Text>
          </View>
          <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
            <Image source={icons.star} className='size-4' />
            <Text className='text-white font-bold text-sm'>{Math.round(movie?.vote_average ?? 0)}/10</Text>
            <Text className='text-light-200 text-sm'>({movie?.vote_count} votes)</Text>
          </View>
          <MovieInfo label='Overview' value={movie?.overview} />
          <View className='flex-col items-start justify-center mt-5'>
            <Text className='text-light-200 font-normal text-sm'>Genres</Text>
            <View className='mt-2 w-full flex-row flex-wrap gap-x-2'>
              {movie?.genres.map((g) => (
                <View key={g.id} className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
                  <Text className='text-white text-sm font-bold'>{g?.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <MovieInfo label='Genres' value={movie?.genres?.map((g) => g.name).join(' • ') || 'N/A'} />
          <View className='flex flex-row justify-between w-1/2'>
            <MovieInfo label='Budget' value={`$${(movie?.budget ?? 0) / 1_000_000} million`} />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>
          <MovieInfo label='Tagline' value={movie?.tagline} />
          <MovieInfo label='Production Companies' value={movie?.production_companies.map((c) => c.name).join(' • ') || 'N/A'} />
        </View>
        <TouchableOpacity className='absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50' onPress={router.back}>
          <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor='#fff' />
          <Text className='text-white font-semibold text-base'>Go back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default MovieDetails;
