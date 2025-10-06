import { useI18n } from '@rspress/core/runtime'
import { HomeFooter } from '@rspress/core/theme'
// @ts-expect-error
import Example from './example.mdx'

const Home: React.FC = () => {
  const t = useI18n<typeof import('i18n')>()
  return (
    <div className="home">
      <div className="hero">
        <div className="hero__logo">
          <img
            src="https://pic1.imgdb.cn/item/68c7c093c5157e1a8804fb52.svg"
            alt="Zess Logo"
          />
        </div>
        <div className="hero__title">
          <div className="hero__name">Zess</div>
          <div className="hero__tagline">
            {t('taglinePrefix')}
            <span className="hero__tagline__accent">
              {t('taglineAccent')}
            </span>{' '}
            {t('tagline')}
          </div>
          <p className="hero__description">{t('description')}</p>
        </div>
        <div className="hero__button">
          <a
            href={`/zess${t('basePath')}/guide/start/getting-started`}
            className="hero__button__get-started"
          >
            {t('getStarted')}
          </a>
          <a
            href="https://github.com/rpsffx/zess"
            className="hero__button__github"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              viewBox="0 0 24 24"
              className="hero__button__github-icon"
            >
              <title>GitHub</title>
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              ></path>
            </svg>
            GitHub
          </a>
        </div>
      </div>
      <div className="features">
        <div className="feature">
          <div className="feature__title">{t('highPerformance')}</div>
          <div className="feature__description">
            {t('highPerformanceDescription')}
          </div>
        </div>
        <div className="feature">
          <div className="feature__title">{t('fullTypeSafety')}</div>
          <div className="feature__description">
            {t('fullTypeSafetyDescription')}
          </div>
        </div>
        <div className="feature">
          <div className="feature__title">{t('fastDevelopment')}</div>
          <div className="feature__description">
            {t('fastDevelopmentDescription')}
          </div>
        </div>
        <div className="feature">
          <div className="feature__title">{t('easyToLearn')}</div>
          <div className="feature__description">
            {t('easyToLearnDescription')}
          </div>
        </div>
      </div>
      <div className="example">
        <Example />
      </div>
      <div className="footer">
        <HomeFooter />
      </div>
    </div>
  )
}

export default Home
