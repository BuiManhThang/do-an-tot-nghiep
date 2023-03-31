import Head from 'next/head'
import MyButton, { MyButtonType } from '@/components/my-button/MyButton'
import MyTextField from '@/components/my-text-field/MyTextField'
import MyPasswordField from '@/components/my-password-field/MyPasswordField'
import MyCheckbox from '@/components/my-checkbox/MyCheckbox'
import MyRadio from '@/components/my-radio/MyRadio'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import MyUploadThumbnail from '@/components/my-upload-img/MyUploadThumbnail'
import { useState } from 'react'
import MyUploadImages from '@/components/my-upload-img/MyUploadImages'
import MySlider from '@/components/my-slider/MySlider'
import MyPopup from '@/components/my-popup/MyPopup'
import MyTable, { Column, TableAlign, TableDataType } from '@/components/my-table/MyTable'

import Image1 from '../assets/images/test/1.jpg'
import Image2 from '../assets/images/test/2.jpg'
import Image3 from '../assets/images/test/3.jpg'
import Image4 from '../assets/images/test/4.jpg'
import Image5 from '../assets/images/test/5.jpg'

const IMAGES = [Image1, Image2, Image3, Image4, Image5]

const OPTIONS: MySelectOption[] = [
  {
    value: 1,
    text: 'Chó Chó Chó Chó Chó Chó Chó Chó',
  },
  {
    value: 2,
    text: 'Mèo',
  },
  {
    value: 3,
    text: 'Gà',
  },
  {
    value: 4,
    text: 'Vịt',
  },
  {
    value: 5,
    text: 'Lợn',
  },
  {
    value: 6,
    text: 'Chim',
  },
]

type User = {
  id: string
  name: string
  gender: boolean
  email: string
  birthday: Date
  salary?: number
}

const COLUMNS: Column[] = [
  {
    dataType: TableDataType.Text,
    fieldName: 'name',
    title: 'Họ tên',
    minWidth: 200,
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Center,
    fieldName: 'gender',
    title: 'Giới tính',
    width: 100,
    minWidth: 100,
    template: (rowData) => {
      const user: User = rowData as User
      if (user.gender === true) {
        return (
          <div className="flex items-center justify-center w-full">
            <i className="fa-solid fa-mars"></i>
          </div>
        )
      }
      return (
        <div className="flex items-center justify-center w-full">
          <i className="fa-regular fa-venus"></i>
        </div>
      )
    },
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'email',
    title: 'Email',
    minWidth: 160,
  },
  {
    dataType: TableDataType.Date,
    align: TableAlign.Center,
    fieldName: 'birthday',
    title: 'Ngày sinh',
    width: 180,
    minWidth: 180,
  },
  {
    dataType: TableDataType.Money,
    align: TableAlign.Right,
    fieldName: 'salary',
    title: 'Lương',
    width: 180,
    minWidth: 180,
  },
]

const USERS: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    gender: true,
    email: 'nva@gmail.com',
    birthday: new Date(2023, 3, 12),
    salary: 10000,
  },
  {
    id: '2',
    name: 'Nguyễn Văn B',
    gender: true,
    email: 'nvb@gmail.com',
    birthday: new Date(2022, 3, 12),
    salary: 100000,
  },
  {
    id: '3',
    name: 'Nguyễn Văn C',
    gender: false,
    email: 'nvc@gmail.com',
    birthday: new Date(2023, 6, 12),
    salary: 80000,
  },
  {
    id: '4',
    name: 'Nguyễn Văn D',
    gender: true,
    email: 'nvd@gmail.com',
    birthday: new Date(2023, 3, 12),
    salary: 40000,
  },
  {
    id: '5',
    name: 'Nguyễn Văn E',
    gender: true,
    email: 'nve@gmail.com',
    birthday: new Date(2023, 3, 12),
    salary: 10000,
  },
  {
    id: '6',
    name: 'Nguyễn Văn F',
    gender: false,
    email: 'nvf@gmail.com',
    birthday: new Date(2023, 3, 12),
    salary: 30000,
  },
]

export default function Home() {
  const [userName, setUserName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isRembember, setIsRemeber] = useState<boolean>(false)
  const [gender, setGender] = useState<string>('male')
  const [selectedOption, setSelectedOption] = useState<
    string | number | null | boolean | undefined
  >(1)
  const [thumbnail, setThumbnail] = useState<string>('')
  const [images, setImages] = useState<string[]>([])
  const [isActivePopup, setIsActivePopup] = useState<boolean>(false)
  const [selectedRows, setSelectedRows] = useState<User[]>([])

  const handleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value)
  }

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleChangeIsRemeber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRemeber(e.target.checked)
  }

  const handleChangeGender = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    setGender(e.target.value)
  }

  const handleChangeSelectedOption = (
    optionValue: string | number | null | boolean | undefined
  ) => {
    setSelectedOption(optionValue)
  }

  const handleChangeThumbnail = (fileUrl: string) => {
    setThumbnail(fileUrl)
  }

  const handleChangeImages = (fileUrls: string[]) => {
    setImages(fileUrls)
  }

  const openPopup = () => {
    setIsActivePopup(true)
  }

  const closePopup = () => {
    setIsActivePopup(false)
  }

  const handleSelectRows = (newSelectedRows: any[]) => {
    setSelectedRows(newSelectedRows)
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center gap-y-2 min-h-[200vh]">
        <div className="text-xl text-primary">hello</div>

        {/* Select */}
        <div className="hidden flex-col items-center justify-center gap-y-2">
          <div className="w-52">
            <MySelect
              id="selectedOption1"
              name="selectedOption"
              label="Động vật yêu thích"
              value={selectedOption}
              options={OPTIONS}
              onChange={handleChangeSelectedOption}
            />
          </div>
          <div className="w-52">
            <MySelect
              id="selectedOption2"
              name="selectedOption"
              label="Động vật yêu thích"
              required={true}
              error="Chó này"
              value={selectedOption}
              options={OPTIONS}
              onChange={handleChangeSelectedOption}
            />
          </div>
          <div className="w-52">
            <MySelect
              id="selectedOption3"
              name="selectedOption"
              label="Động vật yêu thích"
              required={true}
              startIcon={<i className="fa-solid fa-code"></i>}
              error="Chó này"
              value={selectedOption}
              options={OPTIONS}
              onChange={handleChangeSelectedOption}
            />
          </div>
        </div>

        {/* Button */}
        <div className="hidden flex-col items-center justify-center gap-y-2">
          <h3>Button</h3>
          <MyButton
            text="Mua hàng tại đây"
            startIcon={<i className="fa-solid fa-magnifying-glass"></i>}
          />
          <MyButton title="Tìm kiếm" startIcon={<i className="fa-solid fa-magnifying-glass"></i>} />
          <MyButton
            startIcon={<i className="fa-solid fa-magnifying-glass"></i>}
            text="Button with start and end icons"
            endIcon={<i className="fa-solid fa-code"></i>}
          />
          <MyButton text="Button secondary" type={MyButtonType.Secondary} />
        </div>

        {/* TextField */}
        <div className="hidden flex-col items-center justify-center gap-y-2">
          <div className="w-52">
            <MyTextField
              id="userName"
              name="userName"
              label="Tên đăng nhập"
              required={true}
              error="Sai tên đăng nhập hoặc mật khẩu"
              value={userName}
              onChange={handleChangeUserName}
            />
          </div>
          <div className="w-52">
            <MyPasswordField
              id="password"
              name="password"
              label="Mật khẩu"
              required={true}
              value={password}
              onChange={handleChangePassword}
            />
          </div>
          <div className="w-52">
            <MyTextField
              id="startIcon"
              name="startIcon"
              label="StartIcon"
              startIcon={<i className="fa-solid fa-code"></i>}
              value={password}
              onChange={handleChangePassword}
            />
          </div>
          <div className="w-52">
            <MyTextField
              id="endIcon"
              name="endIcon"
              label="EndIcon"
              endIcon={<i className="fa-solid fa-code"></i>}
              startIcon={<i className="fa-solid fa-code"></i>}
              error="hello"
              value={password}
              onChange={handleChangePassword}
            />
          </div>
        </div>

        {/* Checkbox */}
        <div className="hidden flex-col items-center justify-center gap-y-2">
          <MyCheckbox
            id="isRemeber"
            name="isRemeber"
            label="Nhớ đăng nhập"
            checked={isRembember}
            onChange={handleChangeIsRemeber}
          />
        </div>

        {/* Radio */}
        <div className="hidden flex-col items-center justify-center gap-y-2">
          <MyRadio
            id="genderMale"
            name="gender"
            label="Nam"
            value="male"
            checked={gender === 'male' ? true : false}
            onChange={handleChangeGender}
          />
          <MyRadio
            id="genderFemale"
            name="gender"
            label="Nữ"
            value="female"
            checked={gender === 'female' ? true : false}
            onChange={handleChangeGender}
          />
        </div>

        {/* Thumbnail */}
        <div className="hidden flex-col items-center justify-center gap-y-2">
          <div className="w-96">
            <MyUploadThumbnail
              id="thumbnail"
              name="thumbnail"
              label="Ảnh đại diện sản phẩm"
              required={true}
              error="alo"
              width={384}
              height={384}
              value={thumbnail}
              onChange={handleChangeThumbnail}
            />
          </div>
        </div>

        {/* Images */}
        <div className="flex flex-col items-center justify-center gap-y-2">
          <div className="w-96">
            <MyUploadImages
              id="images"
              name="images"
              label="Hình ảnh sản phẩm"
              value={images}
              onChange={handleChangeImages}
            />
          </div>
          <div className="w-96">
            <MyUploadImages
              id="images"
              name="images"
              label="Hình ảnh sản phẩm"
              required={true}
              error="Có lỗi"
              value={images}
              onChange={handleChangeImages}
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-[80%]">
          <MyTable
            columns={COLUMNS}
            data={USERS}
            checkable={true}
            rowIdField="id"
            tableHeight={200}
            haveRowIndex={true}
            selectedRows={selectedRows}
            stickyFirstColumn={true}
            editIcon={
              <i className="fa-solid fa-pen-to-square text-lg leading-none text-gray-700 cursor-pointer transition-colors hover:text-primary"></i>
            }
            deleteIcon={
              <i className="fa-solid fa-trash ext-lg text-gray-700 leading-none cursor-pointer transition-colors hover:text-red-600"></i>
            }
            onSelectRows={handleSelectRows}
            onEdit={(e: any) => console.log(e)}
            onDelete={(e: any) => console.log(e)}
          />
        </div>

        {/* Slider */}
        <div className="flex flex-col items-center justify-center gap-y-2">
          <MySlider images={IMAGES} />
        </div>

        {/* Popup */}
        <div className="flex flex-col items-center justify-center gap-y-2">
          <MyButton text="Mở popup" onClick={openPopup} />
          <MyPopup isActive={isActivePopup} title="Popup thử nghiệm" onClose={closePopup}>
            <div className="w-96 h-96 italic">hello</div>
          </MyPopup>
        </div>
      </main>
    </>
  )
}
