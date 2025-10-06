import { useLang, useNavigate } from '@rspress/core/runtime'
import {
  Search as PluginAlgoliaSearch,
  ZH_LOCALES,
} from '@rspress/plugin-algolia/runtime'

const BASE_PATH_REGEX = /^\/zess\//
const Search: React.FC = () => {
  const navigate = useNavigate()
  const lang = useLang()
  return (
    <PluginAlgoliaSearch
      docSearchProps={{
        appId: '80NNROT76W',
        apiKey: 'e1534e12ea32a166b6028e9d962fbfe6',
        indexName: 'Zess Documentation',
        searchParameters: {
          facetFilters: [`lang:${lang}`],
        },
        navigator: {
          navigate({ itemUrl }) {
            navigate(itemUrl.replace(BASE_PATH_REGEX, '/'))
          },
        },
      }}
      locales={ZH_LOCALES}
    />
  )
}

export { Search }

export * from '@rspress/core/theme'
