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
        appId: '80NNROT76W',
        apiKey: 'e1534e12ea32a166b6028e9d962fbfe6',
        indexName: 'Zess Documentation',
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
