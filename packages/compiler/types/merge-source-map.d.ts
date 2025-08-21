declare module 'merge-source-map' {
  import type { RawSourceMap } from 'source-map'
  export default function merge(
    oldMap: RawSourceMap | string,
    newMap: RawSourceMap | string,
  ): RawSourceMap | void
}
