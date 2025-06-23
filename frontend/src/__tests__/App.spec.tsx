jest.mock('../hooks/useHandTracking', () =>
  jest.requireActual('../__mocks__/useHandTracking.ts')
);

jest.mock('../components/Modals/SignInModal', () => ({
  __esModule: true,
  default: () => <div>Mocked SignInModal</div>,
}));

jest.mock('../components/Modals/SignUpModal', () => ({
  __esModule: true,
  default: () => <div>Mocked SignUpModal</div>,
}));

jest.mock('../components/Modals/ForgotPasswordModal', () => ({
  __esModule: true,
  default: () => <div>Mocked ForgotPasswordModal</div>,
}));

jest.mock('../components/Modals/SettingsModal', () => ({
  __esModule: true,
  default: () => <div>Mocked SettingsModal</div>,
}));

jest.mock('../components/Webcam/WebcamFeed', () => ({
  __esModule: true,
  default: () => <div>Mocked WebcamFeed</div>,
}));

jest.mock('../components/Webcam/VideoControls', () => ({
  __esModule: true,
  default: () => <div>Mocked VideoControls</div>,
}));


import {render} from '@testing-library/react'
import App from '../App'

describe('Renders App', () => {
    it('Renders App', () => {
        render(<App/>)
    })
})