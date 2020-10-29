import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import * as Yup from 'yup'

import orphanage from '../models/Orphanage'

import orphanagesView from '../views/orphanages_view'

export default {
  async index(req: Request, res: Response) {
    const orphanagesRepository = getRepository(orphanage)

    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    })

    return res.json(orphanagesView.renderMany(orphanages))
  },

  async show(req: Request, res: Response) {
    const { id } = req.params
    const orphanagesRepository = getRepository(orphanage)

    const orphanageFound = await orphanagesRepository.findOneOrFail(id)

    return res.json(orphanagesView.render(orphanageFound))
  },

  async create(req: Request, res: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends
    } = req.body

    const orphanagesRepository = getRepository(orphanage)

    const requestImages = req.files as Express.Multer.File[]

    const images = requestImages.map(img => {
      return { path: img.filename }
    })

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images
    }

    const schemaValidation = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.string().required(),
      longitude: Yup.string().required(),
      about: Yup.string().required(),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.string().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required()
        })
      )
    })

    await schemaValidation.validate(data, {
      abortEarly: false
    })

    const newOrphanage = orphanagesRepository.create(data)

    await orphanagesRepository.save(newOrphanage)

    return res.status(201).json(orphanagesView.render(newOrphanage))
  }
}