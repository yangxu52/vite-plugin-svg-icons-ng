import {
  bold,
  each,
  heading,
  link,
  newline,
  reference,
  referenceRepositoryUrl,
  repositoryUrl,
  segments,
  strings,
  url,
  words,
} from '@conventional-changelog/template'

function commitPartial(context, commit) {
  const commitLink = commit.hash
    ? context.linkReferences
      ? `(${link(commit.shortHash, url(repositoryUrl(context), context.commit, commit.hash))})`
      : commit.shortHash
    : ''
  const references = each(
    commit.references,
    (commitReference) =>
      context.linkReferences
        ? link(reference(commitReference), url(referenceRepositoryUrl(context, commitReference), context.issue, commitReference.issue))
        : reference(commitReference),
    ' '
  )

  return strings(words(commit.subject || commit.header, commitLink), references && `, closes ${references}`)
}

function template(context) {
  return segments(
    context.headerPartial(context),
    each(
      context.noteGroups,
      (group) =>
        segments(
          heading(3, words('⚠', group.title)),
          each(group.notes, (note) => `- ${bold(note.text)}`)
        ),
      newline(2)
    ),
    each(
      context.commitGroups,
      (group) =>
        segments(
          group.title && heading(3, group.title),
          each(group.commits, (commit) => `- ${context.commitPartial(context, commit)}`)
        ),
      newline(2)
    ),
    context.footerPartial(context)
  )
}

export default {
  header: '# Changelog\n',
  skip: { commit: true, tag: true },
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'feature', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'revert', section: 'Reverts', hidden: true },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'docs', section: 'Documentation' },
    { type: 'chore', section: 'Miscellaneous Chores' },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'test', section: 'Tests' },
    { type: 'style', section: 'Styles', hidden: true },
    { type: 'build', section: 'Build System', hidden: true },
    { type: 'ci', section: 'Continuous Integration', hidden: true },
  ],
  writerOpts: {
    template,
    commitPartial,
  },
}
