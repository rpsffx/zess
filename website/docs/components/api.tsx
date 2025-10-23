import { useI18n } from '@rspress/core/runtime'
import { Overview } from '@rspress/core/theme'

const APIOverview: React.FC<{ lang: 'en' | 'zh' }> = ({ lang }) => {
  const t = useI18n<typeof import('i18n')>()
  const isEnglish = lang === 'en'
  return (
    <Overview
      groups={[
        {
          name: t('core'),
          items: [
            {
              text: t('basicReactivity'),
              link: `${t('basePath')}/guide/core/basic-reactivity`,
              headers: [
                {
                  id: 'usesignal',
                  text: 'useSignal',
                  depth: 2,
                  charIndex: isEnglish ? 20 : 9,
                },
                {
                  id: 'useeffect',
                  text: 'useEffect',
                  depth: 2,
                  charIndex: isEnglish ? 1082 : 602,
                },
                {
                  id: 'usememo',
                  text: 'useMemo',
                  depth: 2,
                  charIndex: isEnglish ? 1921 : 1103,
                },
              ],
            },
            {
              text: t('lifecycle'),
              link: `${t('basePath')}/guide/core/lifecycle`,
              headers: [
                {
                  id: 'onmount',
                  text: 'onMount',
                  depth: 2,
                  charIndex: isEnglish ? 13 : 8,
                },
                {
                  id: 'oncleanup',
                  text: 'onCleanup',
                  depth: 2,
                  charIndex: isEnglish ? 393 : 215,
                },
                {
                  id: 'onerror',
                  text: 'onError',
                  depth: 2,
                  charIndex: isEnglish ? 1203 : 758,
                },
              ],
            },
            {
              text: t('components'),
              link: `${t('basePath')}/guide/core/components`,
              headers: [
                {
                  id: 'for',
                  text: '<For>',
                  depth: 2,
                  charIndex: isEnglish ? 14 : 8,
                },
                {
                  id: 'index',
                  text: '<Index>',
                  depth: 2,
                  charIndex: isEnglish ? 832 : 542,
                },
                {
                  id: 'show',
                  text: '<Show>',
                  depth: 2,
                  charIndex: isEnglish ? 1730 : 1114,
                },
                {
                  id: 'switch',
                  text: '<Switch>',
                  depth: 2,
                  charIndex: isEnglish ? 3022 : 2070,
                },
                {
                  id: 'match',
                  text: '<Match>',
                  depth: 2,
                  charIndex: isEnglish ? 3735 : 2631,
                },
                {
                  id: 'errorboundary',
                  text: '<ErrorBoundary>',
                  depth: 2,
                  charIndex: isEnglish ? 4262 : 2985,
                },
              ],
            },
            {
              text: t('reactiveUtilities'),
              link: `${t('basePath')}/guide/core/reactive-utilities`,
              headers: [
                {
                  id: 'untrack',
                  text: 'untrack',
                  depth: 2,
                  charIndex: isEnglish ? 22 : 10,
                },
                {
                  id: 'batch',
                  text: 'batch',
                  depth: 2,
                  charIndex: isEnglish ? 576 : 352,
                },
                {
                  id: 'on',
                  text: 'on',
                  depth: 2,
                  charIndex: isEnglish ? 1206 : 756,
                },
                {
                  id: 'createroot',
                  text: 'createRoot',
                  depth: 2,
                  charIndex: isEnglish ? 2222 : 1404,
                },
                {
                  id: 'getowner',
                  text: 'getOwner',
                  depth: 2,
                  charIndex: isEnglish ? 3162 : 1950,
                },
                {
                  id: 'runwithowner',
                  text: 'runWithOwner',
                  depth: 2,
                  charIndex: isEnglish ? 3541 : 2169,
                },
                {
                  id: 'maparray',
                  text: 'mapArray',
                  depth: 2,
                  charIndex: isEnglish ? 4125 : 2531,
                },
                {
                  id: 'indexarray',
                  text: 'indexArray',
                  depth: 2,
                  charIndex: isEnglish ? 5031 : 3115,
                },
                {
                  id: 'mergeprops',
                  text: 'mergeProps',
                  depth: 2,
                  charIndex: isEnglish ? 5983 : 3749,
                },
                {
                  id: 'splitprops',
                  text: 'splitProps',
                  depth: 2,
                  charIndex: isEnglish ? 6853 : 4375,
                },
                {
                  id: 'catcherror',
                  text: 'catchError',
                  depth: 2,
                  charIndex: isEnglish ? 7617 : 4950,
                },
              ],
            },
            {
              text: t('storeUtilities'),
              link: `${t('basePath')}/guide/core/store-utilities`,
              headers: [
                {
                  id: 'usestore',
                  text: 'useStore',
                  depth: 2,
                  charIndex: isEnglish ? 19 : 13,
                },
              ],
            },
            {
              text: t('secondaryPrimitives'),
              link: `${t('basePath')}/guide/core/secondary-primitives`,
              headers: [
                {
                  id: 'usecomputed',
                  text: 'useComputed',
                  depth: 2,
                  charIndex: isEnglish ? 24 : 10,
                },
                {
                  id: 'userendereffect',
                  text: 'useRenderEffect',
                  depth: 2,
                  charIndex: isEnglish ? 619 : 349,
                },
                {
                  id: 'useselector',
                  text: 'useSelector',
                  depth: 2,
                  charIndex: isEnglish ? 1462 : 868,
                },
              ],
            },
            {
              text: t('rendering'),
              link: `${t('basePath')}/guide/core/rendering`,
              headers: [
                {
                  id: 'render',
                  text: 'render',
                  depth: 2,
                  charIndex: isEnglish ? 13 : 6,
                },
              ],
            },
            {
              text: t('jsxAttributes'),
              link: `${t('basePath')}/guide/core/jsx-attributes`,
              headers: [
                {
                  id: 'class',
                  text: 'class',
                  depth: 2,
                  charIndex: isEnglish ? 20 : 13,
                },
                {
                  id: 'style',
                  text: 'style',
                  depth: 2,
                  charIndex: isEnglish ? 897 : 462,
                },
                {
                  id: 'innerhtml',
                  text: 'innerHTML',
                  depth: 2,
                  charIndex: isEnglish ? 1666 : 960,
                },
                {
                  id: 'textcontent',
                  text: 'textContent',
                  depth: 2,
                  charIndex: isEnglish ? 2151 : 1241,
                },
                {
                  id: 'on___',
                  text: 'on___',
                  depth: 2,
                  charIndex: isEnglish ? 2691 : 1566,
                },
                {
                  id: 'ref',
                  text: 'ref',
                  depth: 2,
                  charIndex: isEnglish ? 3657 : 2091,
                },
              ],
            },
          ],
        },
        {
          name: t('router'),
          items: [
            {
              text: t('components'),
              link: `${t('basePath')}/guide/router/components`,
              headers: [
                {
                  id: 'router',
                  text: '<Router>',
                  depth: 2,
                  charIndex: isEnglish ? 16 : 8,
                },
                {
                  id: 'route',
                  text: '<Route>',
                  depth: 2,
                  charIndex: isEnglish ? 602 : 392,
                },
                {
                  id: 'link',
                  text: '<Link>',
                  depth: 2,
                  charIndex: isEnglish ? 1473 : 990,
                },
              ],
            },
            {
              text: t('primitives'),
              link: `${t('basePath')}/guide/router/primitives`,
              headers: [
                {
                  id: 'usenavigate',
                  text: 'useNavigate',
                  depth: 2,
                  charIndex: isEnglish ? 16 : 10,
                },
                {
                  id: 'usesearchparams',
                  text: 'useSearchParams',
                  depth: 2,
                  charIndex: isEnglish ? 1410 : 1059,
                },
                {
                  id: 'usebeforeleave',
                  text: 'useBeforeLeave',
                  depth: 2,
                  charIndex: isEnglish ? 3133 : 2322,
                },
                {
                  id: 'uselocation',
                  text: 'useLocation',
                  depth: 2,
                  charIndex: isEnglish ? 4683 : 3279,
                },
              ],
            },
          ],
        },
      ]}
    />
  )
}

export default APIOverview
