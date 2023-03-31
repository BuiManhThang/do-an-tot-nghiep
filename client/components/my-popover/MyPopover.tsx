import React from 'react'
import { Popover, Transition } from '@headlessui/react'

type Props = {
  target: (
    open: boolean,
    close: (
      focusableElement?:
        | HTMLElement
        | React.MutableRefObject<HTMLElement | null>
        | React.MouseEvent<HTMLElement>
    ) => void
  ) => React.ReactNode | React.ReactNode[]
  content: (
    open: boolean,
    close: (
      focusableElement?:
        | HTMLElement
        | React.MutableRefObject<HTMLElement | null>
        | React.MouseEvent<HTMLElement>
    ) => void
  ) => React.ReactNode | React.ReactNode[]
  popoverClassName?: string
  targetClassName?: string
  contentClassName?: string
  transitionEnter?: string
  transitionEnterFrom?: string
  transitionEnterTo?: string
  transitionLeave?: string
  transitionLeaveFrom?: string
  transitionLeaveTo?: string
}

const MyPopover = ({
  target,
  content,
  popoverClassName = '',
  targetClassName = '',
  contentClassName = '',
  transitionEnter = 'transition duration-200 ease-out',
  transitionEnterFrom = 'transform translate-y-2 opacity-0',
  transitionEnterTo = 'transform translate-y-0 opacity-100',
  transitionLeave = 'transition duration-200 ease-out',
  transitionLeaveFrom = 'transform translate-y-0 opacity-100',
  transitionLeaveTo = 'transform translate-y-2 opacity-0',
}: Props) => {
  return (
    <Popover className={popoverClassName}>
      {({ open, close }) => (
        <>
          <Popover.Button className={targetClassName}>
            {typeof target === 'function' ? target(open, close) : target}
          </Popover.Button>
          <Transition
            enter={transitionEnter}
            enterFrom={transitionEnterFrom}
            enterTo={transitionEnterTo}
            leave={transitionLeave}
            leaveFrom={transitionLeaveFrom}
            leaveTo={transitionLeaveTo}
          >
            <Popover.Panel className={contentClassName}>
              {typeof content === 'function' ? content(open, close) : content}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default MyPopover
