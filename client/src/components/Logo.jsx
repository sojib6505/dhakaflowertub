import logo from '../assets/images/logo.png'

export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-0" role="presentation">
      <img className="w-17 mb-1.5" src={logo} alt="Dhaka Flower Tub Logo" />
      <p className="text-12 font-semibold text-green-900">Dhaka Flower Tub</p>
    </div>
  )
}
