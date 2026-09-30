import Image from 'next/image'

const logoAsset = '/assets/brand/RouteyAI_logo_temp-removebg-preview.png'

interface RouteyLogoProps {
  size?: number
  variant?: 'gradient' | 'white'
}

const ASSET_SIZE = 500
const MARK_CROP = {
  x: 166,
  y: 115,
  size: 170,
}

export function RouteyLogo({ size = 28 }: RouteyLogoProps) {
  const scale = size / MARK_CROP.size
  const rendered = Math.ceil(ASSET_SIZE * scale)

  return (
    <span
      aria-hidden="true"
      className="relative block shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src={logoAsset}
        alt=""
        width={rendered}
        height={rendered}
        className="absolute max-w-none select-none"
        draggable={false}
        priority={size >= 48}
        style={{
          width: rendered,
          height: rendered,
          left: -MARK_CROP.x * scale,
          top: -MARK_CROP.y * scale,
        }}
      />
    </span>
  )
}
