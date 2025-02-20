import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    User,
    UserRole

} from 'src/users/entities/users.entity';
import { Category } from 'src/categories/entities/categories.entity';
import { Subcategory } from 'src/subcategories/entities/subcategories.entity';
import { Document } from 'src/documents/entities/documents.entity';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        @InjectRepository(Subcategory)
        private readonly subcategoryRepository: Repository<Subcategory>,
    ) { }


    async getsandcCounts() {
        // Count documents per category name (from documents table)
        const categoryCounts = await this.documentRepository
            .createQueryBuilder('document')
            .select('document.category_name', 'categoryName')  // Selecting category_name from documents
            .addSelect('COUNT(document.document_id)', 'documentCount') // Counting documents
            .groupBy('document.category_name') // Grouping by category
            .getRawMany();

        // Count documents per subcategory name (from documents table)
        const subcategoryCounts = await this.documentRepository
            .createQueryBuilder('document')
            .select('document.subcategory_name', 'subcategoryName')  // Selecting subcategory_name from documents
            .addSelect('COUNT(document.document_id)', 'documentCount') // Counting documents
            .groupBy('document.subcategory_name') // Grouping by subcategory
            .getRawMany();

        return {
            categoryCounts: categoryCounts,
            subcategoryCounts: subcategoryCounts
        };
    }


    async getDistributorStatistics(distributorId: number) {
        // Calculate today's date in the correct format for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);  // Set to midnight to ignore time part
        const todayDate = today.toISOString().split('T')[0];  // "2025-02-17"

        // Total documents for this distributor
        const totalDocuments = await this.documentRepository
            .createQueryBuilder('documents')
            .where('documents.distributor_id = :distributorId', { distributorId })
            .getCount();

        // Count by status (Pending, Rejected, Uploaded, Completed)
        const statusCounts = await this.documentRepository
            .createQueryBuilder('documents')
            .select('documents.status', 'status')
            .addSelect('COUNT(documents.document_id)', 'count')
            .where('documents.distributor_id = :distributorId', { distributorId })
            .groupBy('documents.status')
            .getRawMany();

        // Daily document count for this distributor, matching today’s date and distributor_id
        const dailyDocumentCounts = await this.documentRepository
            .createQueryBuilder('documents')
            .select('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d")', 'date')
            .addSelect('COUNT(documents.document_id)', 'count')
            .where('documents.distributor_id = :distributorId', { distributorId })
            .andWhere('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d") = :todayDate', { todayDate })
            .groupBy('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d")')
            .getRawMany();

        // Daily status counts (Pending, Completed, Uploaded) for today
        const dailyStatusCounts = await this.documentRepository
            .createQueryBuilder('documents')
            .select('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d")', 'date')
            .addSelect('documents.status', 'status')
            .addSelect('COUNT(documents.document_id)', 'count')
            .where('documents.distributor_id = :distributorId', { distributorId })
            .andWhere('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d") = :todayDate', { todayDate })
            .andWhere('documents.status IN (:...statuses)', { statuses: ['pending', 'completed', 'uploaded'] })
            .groupBy('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d"), documents.status')
            .getRawMany();

        // Total users linked to this distributor
        const totalUsers = await this.documentRepository
            .createQueryBuilder('documents')
            .select('COUNT(DISTINCT documents.user_id)', 'count')
            .where('documents.distributor_id = :distributorId', { distributorId })
            .getRawOne();

        // Daily count of users linked to this distributor for today
        const dailyUsers = await this.documentRepository
            .createQueryBuilder('documents')
            .select('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d")', 'date')
            .addSelect('COUNT(DISTINCT documents.user_id)', 'count')
            .where('documents.distributor_id = :distributorId', { distributorId })
            .andWhere('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d") = :todayDate', { todayDate })
            .groupBy('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d")')
            .getRawMany();

        // Total completed/certified users linked to this distributor
        const totalCompletedCertifiedUsers = await this.documentRepository
            .createQueryBuilder('documents')
            .select('COUNT(DISTINCT documents.user_id)', 'count')
            .where('documents.distributor_id = :distributorId', { distributorId })
            .andWhere('documents.status IN (:...statuses)', { statuses: ['completed', 'certified'] })
            .getRawOne();

        // Daily count of completed/certified users linked to this distributor for today
        const dailyCompletedCertifiedUsers = await this.documentRepository
            .createQueryBuilder('documents')
            .select('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d")', 'date')
            .addSelect('COUNT(DISTINCT documents.user_id)', 'count')
            .where('documents.distributor_id = :distributorId', { distributorId })
            .andWhere('documents.status IN (:...statuses)', { statuses: ['completed', 'certified'] })
            .andWhere('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d") = :todayDate', { todayDate })
            .groupBy('DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d")')
            .getRawMany();

        return {
            distributorId,
            totalDocuments,
            statusCounts,
            dailyDocumentCounts,
            dailyStatusCounts, // Include daily status counts for today
            totalUsers: totalUsers.count, // Return total users count
            dailyUsers,
            totalCompletedCertifiedUsers: totalCompletedCertifiedUsers.count, // Return total completed/certified users count
            dailyCompletedCertifiedUsers,
        };
    }


    async getCounts() {
        // Count all records from each table
        const userCount = await this.userRepository.count();
        const distributorCount = await this.userRepository.count({
            where: { role: UserRole.DISTRIBUTOR },
        }); // Count of users with 'Distributor' role
        const documentCount = await this.documentRepository.count();
        const categoryCount = await this.categoryRepository.count();
        const subcategoryCount = await this.subcategoryRepository.count();

        // ✅ Count documents per category
        const categoryWiseCounts = await this.documentRepository
            .createQueryBuilder('document')
            .select('document.category_name', 'categoryName')
            .addSelect('COUNT(document.document_id)', 'documentCount') // Use document_id
            .groupBy('document.category_name')
            .getRawMany();

        // ✅ Get total document count based on status
        const documentStatusCounts = await this.documentRepository
            .createQueryBuilder('document')
            .select('document.status', 'status')
            .addSelect('COUNT(document.document_id)', 'count')
            .groupBy('document.status')
            .getRawMany();

        // ✅ Get daily document count based on status
        const dailyDocumentStatusCounts = await this.documentRepository
            .createQueryBuilder('document')
            .select('DATE(document.uploaded_at)', 'date') // Extract date from timestamp
            .addSelect('document.status', 'status')
            .addSelect('COUNT(document.document_id)', 'count') // Use document_id
            .groupBy('DATE(document.uploaded_at), document.status')
            .getRawMany();

        // ✅ Get daily document count
        const dailyDocumentCounts = await this.documentRepository
            .createQueryBuilder('document')
            .select('DATE(document.uploaded_at)', 'date') // Extract date from timestamp
            .addSelect('COUNT(document.document_id)', 'count') // Use document_id
            .groupBy('DATE(document.uploaded_at)')
            .getRawMany();

        // ✅ Get daily user count
        const dailyUserCount = await this.userRepository
            .createQueryBuilder('user')
            .select("DATE(user.created_at)", "date")
            .addSelect("COUNT(user.user_id)", "count") // Change `id` to `user_id`
            .groupBy("DATE(user.created_at)")
            .getRawMany();

        // ✅ Get daily category count
        const dailyCategoryCount = await this.categoryRepository
            .createQueryBuilder('category')
            .select("DATE(category.created_at)", "date")
            .addSelect("COUNT(category.category_id)", "count")
            .groupBy("DATE(category.created_at)")
            .getRawMany();

        // ✅ Get daily subcategory count
        const dailySubcategoryCount = await this.subcategoryRepository
            .createQueryBuilder('subcategory')
            .select("DATE(subcategory.created_at)", "date")
            .addSelect("COUNT(subcategory.subcategory_id)", "count")
            .groupBy("DATE(subcategory.created_at)")
            .getRawMany();

        return {
            totalCounts: {
                users: userCount,
                distributors: distributorCount, // Added distributor count
                documents: documentCount,
                categories: categoryCount,
                subcategories: subcategoryCount,
                documentStatus: documentStatusCounts, // Added document status counts
            },
            categoryWiseCounts, // Documents count per category
            dailyCounts: {
                documents: dailyDocumentCounts, // Daily document count
                users: dailyUserCount, // Daily user registrations
                categories: dailyCategoryCount, // Daily category count
                subcategories: dailySubcategoryCount, // Daily subcategory count
                documentStatus: dailyDocumentStatusCounts, // Daily document status counts
            },
        };
    }
}
