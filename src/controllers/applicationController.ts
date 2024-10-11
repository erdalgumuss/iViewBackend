import { Request, Response, NextFunction } from 'express';
import Interview from '../models/Interview';
import Application from '../models/Application';

// Mevcut mülakatları listeleme (aktif olanlar)
export const listActiveInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentDate = new Date();
    const interviews = await Interview.find({ expirationDate: { $gt: currentDate } });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Mülakatlar getirilemedi', error });
  }
};

// Başvuru yapma
export const applyForInterview = async (req: Request, res: Response): Promise<void> => {
  const { name, surname, email, phoneNumber, interviewId } = req.body;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Seçilen mülakat bulunamadı' });
      return;
    }

    const application = new Application({
      name,
      surname,
      email,
      phoneNumber,
      interviewId,
    });

    await application.save();
    res.status(201).json({ message: 'Başvuru başarıyla kaydedildi', application });
  } catch (error) {
    res.status(500).json({ message: 'Başvuru kaydedilemedi', error });
  }
};

// Tüm başvuruları listeleme (Admin için)
export const listApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await Application.find().populate('interviewId', 'title');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Başvurular getirilemedi', error });
  }
};

// Başvuru onaylama
export const approveApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404).json({ message: 'Başvuru bulunamadı' });
      return;
    }

    application.status = 'Onaylandı';
    await application.save();

    res.json({ message: 'Başvuru onaylandı', application });
  } catch (error) {
    res.status(500).json({ message: 'Başvuru onaylanamadı', error });
  }
};

// Başvuru reddetme
export const rejectApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404).json({ message: 'Başvuru bulunamadı' });
      return;
    }

    application.status = 'Reddedildi';
    await application.save();

    res.json({ message: 'Başvuru reddedildi', application });
  } catch (error) {
    next(error);
  }
};