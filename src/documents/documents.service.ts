import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/documents.entity';
import { Express } from 'express';
import { S3Service } from './s3.service';
import * as nodemailer from 'nodemailer';


@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,

    private readonly s3Service: S3Service
  ) { }

  async getAllDocuments() {
    try {
      const documents = await this.documentRepository.find();
      return { message: 'Documents fetched successfully', documents };
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw new InternalServerErrorException('Could not fetch documents');
    }
  }
  



  async updateDocumentStatus(documentId: number, status: string, rejectionReason?: string) {
    try {
      // Find the document by its ID
      const document = await this.documentRepository.findOne({ where: { document_id: documentId } });
  
      if (!document) {
        throw new BadRequestException('Document not found.');
      }
  
      // Update the document status
      document.status = status;
      const updatedDocument = await this.documentRepository.save(document);
  
      // Send email based on the updated status
      if (status === 'Approved') {
        await this.sendStatusApprovedEmail(updatedDocument); // Send approved email
      } else if (status === 'Rejected') {
        if (!rejectionReason) {
          throw new BadRequestException('Rejection reason is required for rejected status.');
        }
        await this.sendStatusRejectedEmail(updatedDocument, rejectionReason); // Send rejected email with reason
      } else if (status === 'Completed') {
        await this.sendStatusCompletedEmail(updatedDocument); // Send completed email
      } else if (status === 'Uploaded') {
        await this.sendStatusUploadedEmail(updatedDocument); // Send uploaded email
      }
  
      return { message: 'Status updated successfully', document: updatedDocument };
    } catch (error) {
      console.error('❌ Error updating status:', error);
      throw new InternalServerErrorException('Could not update document status');
    }
  }
  
  // Send email when document status is "Approved"
  async sendStatusApprovedEmail(document: any) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'hzaj osby vnsh ctyq', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email,
      subject: 'Application Status: Approved',
      text: `Dear ${document.name},

Congratulations! Your application for the category "${document.category_name}" has been approved.

We will get back to you soon with the next steps.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }

  // Send email when document status is "Rejected"
//   async sendStatusRejectedEmail(document: any) {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'rutujadeshmukh175@gmail.com', // Your email address
//         pass: 'hzaj osby vnsh ctyq', // Your email password or app password
//       },
//     });

//     const mailOptions = {
//       from: 'rutujadeshmukh175@gmail.com',
//       to: document.email,
//       subject: 'Application Status: Rejected',
//       text: `Dear ${document.name},

// We regret to inform you that your application for the category "${document.category_name}" has been rejected.

// Please contact us for the next steps.

// Best regards,
// Aaradhya Cyber`,
//     };

//     try {
//       await transporter.sendMail(mailOptions);
//       console.log('✅ Email sent successfully');
//     } catch (error) {
//       console.error('❌ Error sending email:', error);
//     }
//   }




async sendStatusRejectedEmail(document: any, rejectionReason: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rutujadeshmukh175@gmail.com', // Your email address
      pass: 'hzaj osby vnsh ctyq', // Your email password or app password
    },
  });

  const mailOptions = {
    from: 'rutujadeshmukh175@gmail.com',
    to: document.email,
    subject: 'Application Status: Rejected',
    text: `Dear ${document.name},

We regret to inform you that your application for the category "${document.category_name}" has been rejected.

Reason for rejection:
${rejectionReason}

Please contact us for the next steps.

Best regards,
Aaradhya Cyber`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

  // Send email when document status is "Completed"
  async sendStatusCompletedEmail(document: any) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'hzaj osby vnsh ctyq', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email,
      subject: 'Application Status: Completed',
      text: `Dear ${document.name},

Your application for the category "${document.category_name}" has been completed.

You can now download your certificate from your portal.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }

  // Send email when document status is "Uploaded"
  async sendStatusUploadedEmail(document: any) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'hzaj osby vnsh ctyq', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email,
      subject: 'Application Status: Uploaded',
      text: `Dear ${document.name},

Your certificate has been sent to your portal. Please check and update it accordingly.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }



  // async uploadDocuments(files: Express.Multer.File[], body: any) {
  //   try {
  //     console.log('📂 Received Files:', files);
  //     console.log('📝 Received Body:', body);

  //     // ✅ Validate that at least one file is uploaded
  //     if (!files || files.length === 0) {
  //       throw new BadRequestException('At least one file must be uploaded.');
  //     }

  //     // ✅ Upload files to S3 and store their details
  //     const documentFiles = await Promise.all(
  //       files.map(async (file) => {
  //         const fileUrl = await this.s3Service.uploadFile(file);
  //         return {
  //           document_type: file.mimetype,
  //           file_path: fileUrl,
  //         };
  //       })
  //     );

  //     // ✅ Parse document_fields safely
  //     let documentFields = {};
  //     if (body.document_fields) {
  //       try {
  //         documentFields = JSON.parse(body.document_fields);
  //       } catch (error) {
  //         console.error('❌ JSON Parse Error:', error);
  //         throw new BadRequestException('Invalid JSON format for document_fields.');
  //       }
  //     }

  //     // ✅ Ensure user_id is properly parsed
  //     const userId = parseInt(body.user_id, 10);
  //     if (isNaN(userId)) {
  //       throw new BadRequestException('Invalid user_id. It must be a number.');
  //     }

  //     // ✅ Check for distributor_id (allow null)
  //     const distributorId = body.distributor_id || null;

  //     // ✅ Create the document entry
  //     const document = this.documentRepository.create({
  //       user_id: userId,
  //       category_name: body.category_name || '',
  //       subcategory_name: body.subcategory_name || '',
  //       name: body.name || '',
  //       email: body.email || '',
  //       phone: body.phone || '',
  //       address: body.address || '',
  //       documents: documentFiles,
  //       status: 'Pending', // Default status
  //       distributor_id: distributorId,
  //       document_fields: documentFields, // ✅ Store new document fields
  //     });

  //     // ✅ Save document to the database
  //     const savedDocument = await this.documentRepository.save(document);
  //     console.log('✅ Document saved successfully:', savedDocument);

  //     // ✅ Send email notification after successful upload
  //     await this.sendDocumentSubmissionEmail(savedDocument);

  //     return { message: 'Upload successful', document: savedDocument };
  //   } catch (error) {
  //     console.error('❌ Error saving document:', error);
  //     throw new InternalServerErrorException('Failed to process document upload');
  //   }
  // }






  async uploadDocuments(files: Express.Multer.File[], body: any) {
    try {
      console.log('📂 Received Files:', files);
      console.log('📝 Received Body:', body);
  
      // ✅ Validate that at least one file is uploaded
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one file must be uploaded.');
      }
  
      // ✅ Upload files to S3 and store their details
      const documentFiles = await Promise.all(
        files.map(async (file) => {
          const fileUrl = await this.s3Service.uploadFile(file);
          return {
            document_type: file.mimetype,
            file_path: fileUrl,
          };
        })
      );
  
      // ✅ Parse document_fields safely
      let documentFields = {};
      if (body.document_fields) {
        try {
          documentFields = JSON.parse(body.document_fields);
        } catch (error) {
          console.error('❌ JSON Parse Error:', error);
          throw new BadRequestException('Invalid JSON format for document_fields.');
        }
      }
  
      // ✅ Ensure user_id is properly parsed
      const userId = parseInt(body.user_id, 10);
      if (isNaN(userId)) {
        throw new BadRequestException('Invalid user_id. It must be a number.');
      }
  
      // ✅ Ensure category_id and subcategory_id are properly parsed
      const categoryId = parseInt(body.category_id, 10);
      if (isNaN(categoryId)) {
        throw new BadRequestException('Invalid category_id. It must be a number.');
      }
  
      const subcategoryId = parseInt(body.subcategory_id, 10);
      if (isNaN(subcategoryId)) {
        throw new BadRequestException('Invalid subcategory_id. It must be a number.');
      }
  
      // ✅ Check for distributor_id (allow null)
      const distributorId = body.distributor_id || null;
  
      // ✅ Generate a unique application_id (APL + 6-digit number)
      let uniqueApplicationId = '';
      let unique = false;
      
      while (!unique) {
        uniqueApplicationId = `APL${Math.floor(100000 + Math.random() * 900000)}`;
        const existingDocument = await this.documentRepository.findOne({
          where: { application_id: uniqueApplicationId },
        });
        if (!existingDocument) {
          unique = true;
        }
      }
  
      // ✅ Create the document entry
      const document = this.documentRepository.create({
        user_id: userId,
        category_id: categoryId,
        category_name: body.category_name || '',
        subcategory_id: subcategoryId,
        subcategory_name: body.subcategory_name || '',
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        address: body.address || '',
        documents: documentFiles,
        status: 'Pending', // Default status
        distributor_id: distributorId,
        document_fields: documentFields, // ✅ Store new document fields
        application_id: uniqueApplicationId, // ✅ Store generated application ID
      });
  
      // ✅ Save document to the database
      const savedDocument = await this.documentRepository.save(document);
      console.log('✅ Document saved successfully:', savedDocument);
  
      // ✅ Send email notification after successful upload
      await this.sendDocumentSubmissionEmail(savedDocument);
  
      return { message: 'Upload successful', document: savedDocument };
    } catch (error) {
      console.error('❌ Error saving document:', error);
      throw new InternalServerErrorException('Failed to process document upload');
    }
  }
  

  // Helper function to send email
  async sendDocumentSubmissionEmail(document: any) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'hzaj osby vnsh ctyq', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email, // Recipient email from the document
      subject: 'Application Submitted Successfully',
      text: `Dear ${document.name},

Thank you for applying! Your application for the category "${document.category_name}" has been submitted successfully.

Your Application ID: ${document.application_id}

We will review your application and get back to you shortly.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }




  async assignDistributor(documentId: number, distributorId: string) {
    try {
      console.log('🔍 Assigning distributor:', distributorId);

      const document = await this.documentRepository.findOne({ where: { document_id: documentId } });

      if (!document) {
        throw new BadRequestException('Document not found.');
      }

      document.distributor_id = distributorId;

      const updatedDocument = await this.documentRepository.save(document);

      console.log('✅ Distributor assigned successfully:', updatedDocument);
      return { message: 'Distributor assigned successfully', document: updatedDocument };
    } catch (error) {
      console.error('❌ Error assigning distributor:', error);
      throw new InternalServerErrorException('Could not assign distributor');
    }
  }

  async getAllDocumentsByDistributor(distributorId: string) {
    try {
      console.log('🔍 Fetching documents for distributor:', distributorId);

      const documents = await this.documentRepository.find({ where: { distributor_id: distributorId } });

      console.log('📄 Documents fetched:', documents);

      return {
        message: 'Documents fetched successfully for distributor',
        documents,
      };
    } catch (error) {
      console.error('❌ Error fetching documents for distributor:', error);
      throw new InternalServerErrorException('Could not fetch documents');
    }
  }

  async getRecentApplications(): Promise<Document[]> {
    return await this.documentRepository
      .createQueryBuilder('document')
      .orderBy('document.uploaded_at', 'DESC') // Sort by uploaded_at in descending order
      .limit(10) // Limit the results to 10
      .getMany();
  }



  // ✅ Update document fields dynamically
  async updateDocumentFields(documentId: number, updatedFields: Record<string, any>) {
    try {
      console.log('🔄 Updating document fields for:', documentId);

      const document = await this.documentRepository.findOne({ where: { document_id: documentId } });

      if (!document) {
        throw new BadRequestException('Document not found.');
      }

      document.document_fields = { ...document.document_fields, ...updatedFields }; // ✅ Merge fields
      const updatedDocument = await this.documentRepository.save(document);

      console.log('✅ Document fields updated successfully:', updatedDocument);
      return { message: 'Document fields updated successfully', document: updatedDocument };
    } catch (error) {
      console.error('❌ Error updating document fields:', error);
      throw new InternalServerErrorException('Could not update document fields');
    }
  }




  async findByCategoryAndSubcategory(categoryId: number, subcategoryId: number) {
    try {
      const documents = await this.documentRepository.find({
        where: {
          category_id: categoryId,
          subcategory_id: subcategoryId,
        },
      });

      return documents.length ? documents : [];
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      return [];
    }
}


async findByCategorySubcategoryAndDistributor(categoryId: number, subcategoryId: number, distributorId?: string) {
  try {
    const whereCondition: any = {
      category_id: categoryId,
      subcategory_id: subcategoryId,
    };

    if (distributorId && distributorId !== 'null') {
      whereCondition.distributor_id = distributorId;
    }

    const documents = await this.documentRepository.find({ where: whereCondition });

    return documents.length ? documents : { message: 'No documents found', documents: [] };
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return { message: 'Failed to fetch documents', error: error.message };
  }
}




async findByCategorySubcategoryAndUser(categoryId: number, subcategoryId: number, userId: number) {
  try {
    let documents = await this.documentRepository.find({
      where: {
        category_id: categoryId,
        subcategory_id: subcategoryId,
        user_id: userId,
      },
    });

    return documents.length ? documents : [];
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return [];
  }
}






  
}



