import { Box, Flex, Text, Badge } from '@chakra-ui/react'
import { yarnColorToCss } from '../utils/colorMap'
import { parseStitchCount } from '../utils/stitchCounter'

export interface PatternCardData {
  patternId: string
  projectName: string
  yarnGauge: string
  yarnColor: string
  startDate: string
  sections: { label: string; lines: string[] }[]
}

interface PatternCardProps {
  pattern: PatternCardData
  isActive: boolean
  onClick: () => void
}

function totalStitchesFor(sections: { lines: string[] }[]): number {
  return sections.reduce((sum, section) => {
    return (
      sum +
      section.lines.reduce((subSum, line, i) => {
        const prev = i > 0 ? parseStitchCount(section.lines[i - 1]!) : undefined
        return subSum + parseStitchCount(line, prev)
      }, 0)
    )
  }, 0)
}

export function PatternCard({ pattern, isActive, onClick }: PatternCardProps) {
  const swatchColor = yarnColorToCss(pattern.yarnColor)
  const totalStitches = totalStitchesFor(pattern.sections ?? [])

  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      w="full"
      textAlign="left"
      borderWidth="2px"
      borderColor={isActive ? 'purple.400' : 'gray.200'}
      borderRadius="xl"
      overflow="hidden"
      bg="white"
      boxShadow={isActive ? 'md' : 'sm'}
      _hover={{ boxShadow: 'md', borderColor: isActive ? 'purple.400' : 'gray.300' }}
      transition="all 0.15s"
      cursor="pointer"
    >
      <Flex>
        <Box w="6px" bg={swatchColor} flexShrink={0} />
        <Box p={3} flex="1">
          <Text fontWeight="bold" fontSize="sm" truncate>
            {pattern.projectName}
          </Text>
          <Flex gap={2} mt={1} align="center" wrap="wrap">
            <Badge colorPalette="purple" variant="subtle" size="sm" borderRadius="full">
              {pattern.yarnGauge}
            </Badge>
            {totalStitches > 0 && (
              <Badge colorPalette="pink" variant="subtle" size="sm" borderRadius="full">
                {totalStitches} st
              </Badge>
            )}
          </Flex>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {pattern.startDate}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}
