import React, { useContext } from 'react'
import './APPDownload.css'
import { assets } from '../../assets/assets'
import { StoreContent } from '../context/StoreContext'

const APPDownload = () => {
  const { settings } = useContext(StoreContent)

  const appTitle = settings?.appTitle || 'TUTA APP'
  const appSubtitle = settings?.appSubtitle || 'Enjoy a Smoother Experience — Download Now'
  const playStoreUrl = settings?.playStoreUrl || '#'
  const appStoreUrl = settings?.appStoreUrl || '#'

  return (
    <div className='app-download' id='app-download'>
        <p>{appSubtitle} <br/>{appTitle}</p>
        <div className="app-download-platforms">
            <a href={playStoreUrl} target='_blank' rel='noreferrer'>
                <img src={assets.play_store} alt="Play Store" />
            </a>
            <a href={appStoreUrl} target='_blank' rel='noreferrer'>
                <img src={assets.app_store} alt="App Store" />
            </a>
        </div>
    </div>
  )
}

export default APPDownload
