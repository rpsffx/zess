import { useLang } from '@rspress/core/runtime'
import {
  Search as PluginAlgoliaSearch,
  ZH_LOCALES,
} from '@rspress/plugin-algolia/runtime'

const Search: React.FC = () => {
  const lang = useLang()
  return (
    <PluginAlgoliaSearch
      docSearchProps={{
        appId: 'SXK65K1R5K',
        apiKey: 'd4cb6321c1869529d9c49889cf5a1f7b',
        indexName: 'Zess Website',
        searchParameters: {
          facetFilters: [`lang:${lang}`],
        },
      }}
      locales={ZH_LOCALES}
    />
  )
}

export { Search }

export * from '@rspress/core/theme'
