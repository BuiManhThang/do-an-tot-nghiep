import React from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import Image, { StaticImageData } from 'next/image'

type Props = {
  width?: number
  height?: number
  images: StaticImageData[] | string[]
}

const MySlider = ({ height = 500, width, images }: Props) => {
  const imageStyle = {
    width: width ? `${width}px` : '100%',
    height: `${height}px`,
  }

  const options = {
    autoplay: true,
    pauseOnHover: false,
    rewind: true,
    width: width,
    height: height,
    gap: '1rem',
  }

  const sizes = `${width}px`

  return (
    <div>
      <Splide aria-label="My Favorite Images" options={options}>
        {images.map((image, index) => (
          <SplideSlide key={index}>
            <div className="relative" style={imageStyle}>
              <Image
                src={image}
                alt={`${index}`}
                fill={true}
                className="object-cover"
                sizes={sizes}
              />
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  )
}

export default MySlider
