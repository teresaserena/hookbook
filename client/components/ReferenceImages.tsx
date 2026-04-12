import { useEffect, useState, useRef } from 'react'
import { Box, Button, Flex, Text, Input, Image, CloseButton, Portal } from '@chakra-ui/react'
import React from 'react'

interface ReferenceImagesProps {
  patternId: string | null
  onCreatePattern: () => Promise<string | null>
}

export function ReferenceImages({ patternId, onCreatePattern }: ReferenceImagesProps) {
  const [images, setImages] = useState<string[]>([])
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (patternId) {
      fetchImages(patternId)
    } else {
      setImages([])
    }
  }, [patternId])

  function fetchImages(name: string) {
    fetch(`/api/patterns/${name}/images`)
      .then((res) => res.json())
      .then((data: string[]) => setImages(data))
      .catch(() => setImages([]))
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    let name = patternId
    if (!name) {
      name = await onCreatePattern()
      if (!name) return
    }

    const form = new FormData()
    form.append('image', file)

    await fetch(`/api/patterns/${name}/images`, {
      method: 'POST',
      body: form,
    })

    fetchImages(name)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(imageName: string) {
    if (!patternId) return
    await fetch(`/api/patterns/${patternId}/images/${imageName}`, {
      method: 'DELETE',
    })
    fetchImages(patternId)
  }

  function imageUrl(imageName: string) {
    const name = patternId
    return `/api/patterns/${name}/images/${imageName}`
  }

  return (
    <Box>
      <Text fontWeight="bold" fontSize="sm" mb={2} color="purple.500">
        Reference Images and Project Images
      </Text>

      <Flex gap={2} wrap="wrap" mb={3}>
        {images.map((img) => (
          <Box
            key={img}
            position="relative"
            w="64px"
            h="64px"
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="gray.200"
            cursor="pointer"
            _hover={{ borderColor: 'purple.400', boxShadow: 'md' }}
            transition="all 0.15s"
          >
            <Image
              src={imageUrl(img)}
              alt={img}
              w="full"
              h="full"
              objectFit="cover"
              onClick={() => setLightboxSrc(imageUrl(img))}
            />
            <CloseButton
              size="xs"
              position="absolute"
              top="0"
              right="0"
              bg="blackAlpha.600"
              color="white"
              borderRadius="full"
              _hover={{ bg: 'red.500' }}
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(img)
              }}
            />
          </Box>
        ))}
      </Flex>

      <Button
        as="label"
        size="xs"
        variant="outline"
        colorPalette="purple"
        borderRadius="lg"
        cursor="pointer"
        borderStyle="dashed"
        borderWidth="2px"
        _hover={{ bg: 'purple.50', borderColor: 'purple.400' }}
      >
        + Add image
        <Input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp"
          onChange={handleUpload}
          display="none"
        />
      </Button>

      {lightboxSrc && (
        <Portal>
          <Box
            position="fixed"
            top="0"
            left="0"
            w="100vw"
            h="100vh"
            bg="blackAlpha.800"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="9999"
            onClick={() => setLightboxSrc(null)}
          >
            <Box position="relative" maxW="90vw" maxH="90vh">
              <Image
                src={lightboxSrc}
                alt="Reference"
                maxW="90vw"
                maxH="90vh"
                objectFit="contain"
                borderRadius="xl"
                boxShadow="2xl"
              />
              <CloseButton
                position="absolute"
                top="-10px"
                right="-10px"
                bg="white"
                color="gray.800"
                borderRadius="full"
                boxShadow="md"
                size="sm"
                _hover={{ bg: 'red.100' }}
                onClick={() => setLightboxSrc(null)}
              />
            </Box>
          </Box>
        </Portal>
      )}
    </Box>
  )
}
