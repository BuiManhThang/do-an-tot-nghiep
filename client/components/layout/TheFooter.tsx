import Link from 'next/link'
import React from 'react'
import { NAVBAR_LINKS } from './TheNavBar'

const TheFooter = () => {
  return (
    <div className="bg-black px-10 mt-14">
      <div className="lg:grid grid-cols-4 gap-x-8">
        <div className="pt-10">
          <h3 className="text-xl font-medium text-white pb-5 mb-5 border-b border-dotted border-white">
            Về chúng tôi
          </h3>
          <div className="text-gray-400 text-justify mb-5 text-sm">
            Tạp hóa hòa phát tự hào là một trong những doanh nghiệp có sự phát triển vượt bậc trong
            năm 2021. Đồng thời cũng là một trong những công ty đi đầu cả nước về bán hàng tạp hóa.
          </div>
          <ul className="flex text-gray-400 text-lg gap-x-3">
            <li className="cursor-pointer hover:text-primary transition-colors duration-300">
              <i className="fa-brands fa-facebook"></i>
            </li>
            <li className="cursor-pointer hover:text-primary transition-colors duration-300">
              <i className="fa-brands fa-twitter"></i>
            </li>
            <li className="cursor-pointer hover:text-primary transition-colors duration-300">
              <i className="fa-brands fa-google"></i>
            </li>
            <li className="cursor-pointer hover:text-primary transition-colors duration-300">
              <i className="fa-brands fa-linkedin"></i>
            </li>
          </ul>
        </div>

        <div className="pt-10">
          <h3 className="text-xl font-medium text-white pb-5 mb-5 border-b border-dotted border-white">
            Liên hệ với chúng tôi
          </h3>
          <div className="text-gray-400 text-justify mb-5 text-sm">
            Hiện tại cửa hàng tạp hóa đang nằm tại Cầu Giấy, Hà Nội. Quý khách hàng có thể ghé thăm
            để lựa chọn sản phẩm và trải nghiệm dịch vụ của cửa hàng.
          </div>
          <div>
            <h4 className="text-lg font-medium text-primary mb-2">Địa chỉ:</h4>
            <div className="text-gray-400 text-justify mb-5 text-sm">370Đ Cầu Giấy Hà Nội</div>
          </div>
          <div>
            <h4 className="text-lg font-medium text-primary mb-2">Thông tin liên lạc:</h4>
            <div className="text-gray-400 text-justify mb-2 text-sm">Điện thoại: 0123456789</div>
            <div className="text-gray-400 text-justify text-sm">
              Email:{' '}
              <span className="cursor-pointer text-gray-100 hover:text-primary transition-colors">
                taphoahoaphat@gmail.com
              </span>
            </div>
          </div>
        </div>

        <div className="pt-10">
          <h3 className="text-xl font-medium text-white pb-5 mb-5 border-b border-dotted border-white">
            Liên kết nhanh
          </h3>
          <ul className="text-sm text-gray-400">
            {NAVBAR_LINKS.map((link, idx) => (
              <li className="mb-5 last:mb-0" key={idx}>
                <Link href={link.url} className="hover:text-primary transition-colors">
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-10">
          <h3 className="text-xl font-medium text-white pb-5 mb-5 border-b border-dotted border-white">
            Đăng ký để bắt đầu mua hàng
          </h3>
          <div className="text-gray-400 text-justify mb-5 text-sm">
            Bằng việc đăng nhập vào hệ thống, bạn có thể bắt đầu đặt hàng, trải nghiệm các dịch vụ
            và nhận các thông tin khuyến mại mới nhất
          </div>
          <div className="relative">
            <input
              className="bg-transparent text-sm text-white placeholder:text-gray-400 py-2 pl-4 pr-12 outline-none border border-gray-400 w-full"
              type="email"
              formNoValidate
              placeholder="Nhập địa chỉ email của bạn..."
            />
            <div className="text-primary text-lg absolute top-1/2 right-4 -translate-y-1/2">
              <i className="fa-regular fa-envelope"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400 py-10 mt-5 border-t border-gray-400 border-solid text-center">
        @2023 TapHoaHoaPhat
      </div>
    </div>
  )
}

export default TheFooter
