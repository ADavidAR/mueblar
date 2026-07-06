package project.backendmueblar.modules.catalog.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import project.backendmueblar.exception.catalog.NotExistentResourceException;
import project.backendmueblar.exception.catalog.ProductAlreadyExistException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.catalog.dtos.request.AttributeSummaryRequestDTO;
import project.backendmueblar.modules.catalog.dtos.request.CategoryRequestDTO;
import project.backendmueblar.modules.catalog.dtos.request.ProductCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.request.VariationRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.AttributeSummaryResponseDTO;
import project.backendmueblar.modules.catalog.dtos.response.CategoryResponseDTO;
import project.backendmueblar.modules.catalog.dtos.response.ProductResponseDTO;
import project.backendmueblar.modules.catalog.dtos.response.VariationResponseDTO;
import project.backendmueblar.modules.catalog.entities.*;
import project.backendmueblar.modules.catalog.repositories.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final RepositoryProduct repositoryProduct;
    private final RepositoryCategory repositoryCategory;
    private final RepositoryAttribute repositoryAttribute;
    private final RepositoryVariation repositoryVariation;

    @Transactional
    public void createProductAndVariations(ProductCreateRequestDTO productCreateRequestDTO) {
        Optional<ProductEntity> optionalProduct = repositoryProduct.findByModelName(productCreateRequestDTO.getModel());
        if (optionalProduct.isPresent()) {
            throw new ProductAlreadyExistException("Product already exist with that model name");
        }

        ProductEntity productEntity = new ProductEntity();
        productEntity.setModelName(productCreateRequestDTO.getModel());
        productEntity.setDescription(productCreateRequestDTO.getDescription());
        productEntity.setDimensions(productCreateRequestDTO.getDimensions());
        productEntity.setEnabled(productCreateRequestDTO.getEnable());

        Set<String> attributes_X_Product = new HashSet<>();
        List<Attribute_X_ProductEntity> attributes_X_ProductEntityList = new ArrayList<>();
        List<VariationEntity> variationEntityList = new ArrayList<>();
        List<Product_X_CategoryEntity> product_x_categoryEntityList = new ArrayList<>();

        List<VariationRequestDTO> variationRequestDTOList = productCreateRequestDTO.getVariations();
        for(VariationRequestDTO thisVariationRequestDTO : variationRequestDTOList) {
            VariationEntity thisVariationEntity = new VariationEntity();
            thisVariationEntity.setSku(thisVariationRequestDTO.getSku());
            thisVariationEntity.setVariationName(thisVariationRequestDTO.getName());
            thisVariationEntity.setInstationParameters(thisVariationRequestDTO.getInstance_params());
            thisVariationEntity.setModel3dPath(thisVariationRequestDTO.getModel_3d());
            thisVariationEntity.setPrice(thisVariationRequestDTO.getPrice());
            thisVariationEntity.setIsTop(thisVariationRequestDTO.getTop());
            thisVariationEntity.setEnabled(thisVariationRequestDTO.getEnabled());

            thisVariationEntity.setProductEntity(productEntity);

            List<ThumbnailEntity> thumbnailEntityList = new ArrayList<>();
            ThumbnailEntity thumbnailEntity = new ThumbnailEntity();
            thumbnailEntity.setThumbnailPath(thisVariationRequestDTO.getThumbnail());
            thumbnailEntity.setIsTop(true);
            thumbnailEntity.setVariationEntity(thisVariationEntity);
            thumbnailEntityList.add(thumbnailEntity);

            List<String> thumbnailResponseList = thisVariationRequestDTO.getImgs();
            for(String thisThumbnailRequest : thumbnailResponseList) {
                ThumbnailEntity thisThumbnailEntity = new ThumbnailEntity();
                thisThumbnailEntity.setThumbnailPath(thisThumbnailRequest);
                thisThumbnailEntity.setIsTop(false);
                thisThumbnailEntity.setVariationEntity(thisVariationEntity);
                thumbnailEntityList.add(thisThumbnailEntity);
            }
            thisVariationEntity.setThumbnailEntities(thumbnailEntityList);

            List<Attribute_X_VariationEntity> attribute_X_variationEntityList = new ArrayList<>();
            List<AttributeSummaryRequestDTO> attributeSummaryRequestDTOList = thisVariationRequestDTO.getAtribs();
            for(AttributeSummaryRequestDTO thisAttributeSummaryRequestDTO : attributeSummaryRequestDTOList) {
                Optional<AttributeEntity> optionalAttribute = repositoryAttribute.findByAttributeId(thisAttributeSummaryRequestDTO.getId());
                if(optionalAttribute.isEmpty()) {
                    throw new ResourceNotFoundException("Attribute was not found");
                }

                AttributeEntity thisAttributeEntity = optionalAttribute.get();
                Attribute_X_VariationEntity thisAttribute_X_VariationEntity = new Attribute_X_VariationEntity();
                thisAttribute_X_VariationEntity.setAttributeValue(thisAttributeSummaryRequestDTO.getValue());
                thisAttribute_X_VariationEntity.setAttributeEntity(thisAttributeEntity);
                thisAttribute_X_VariationEntity.setVariationEntity(thisVariationEntity);
                attribute_X_variationEntityList.add(thisAttribute_X_VariationEntity);

                if (!attributes_X_Product.contains(thisAttributeEntity.getAttributeId())) {
                    Attribute_X_ProductEntity thisAttribute_x_ProductEntity = new Attribute_X_ProductEntity();
                    thisAttribute_x_ProductEntity.setAttributeEntity(thisAttributeEntity);
                    thisAttribute_x_ProductEntity.setProductEntity(productEntity);
                    attributes_X_ProductEntityList.add(thisAttribute_x_ProductEntity);

                    attributes_X_Product.add(thisAttributeEntity.getAttributeId());
                }
            }
            thisVariationEntity.setAttributeXVariationEntities(attribute_X_variationEntityList);
            variationEntityList.add(thisVariationEntity);
        }

        List<CategoryRequestDTO> categoryRequestDTOList = productCreateRequestDTO.getCategories();
        for(CategoryRequestDTO thisCategoryResponseDTO : categoryRequestDTOList) {
            Optional<CategoryEntity> optionalCategory = repositoryCategory.findByCategoryId(thisCategoryResponseDTO.getId());
            if(optionalCategory.isEmpty()){
                throw new ResourceNotFoundException("Category not found");
            }
            Product_X_CategoryEntity thisProduct_X_CategoryEntity = new Product_X_CategoryEntity();
            thisProduct_X_CategoryEntity.setCategoryEntity(optionalCategory.get());
            thisProduct_X_CategoryEntity.setProductEntity(productEntity);
            thisProduct_X_CategoryEntity.setProductEntity(productEntity);
            product_x_categoryEntityList.add(thisProduct_X_CategoryEntity);
        }

        productEntity.setVariationEntityList(variationEntityList);
        productEntity.setProductXCategoryEntityList(product_x_categoryEntityList);
        productEntity.setAttributeXProductEntities(attributes_X_ProductEntityList);

        repositoryProduct.save(productEntity);
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    @Transactional
    public void updateProductAndVariations(String modelOfProduct, ProductCreateRequestDTO productCreateRequestDTO) {
        Optional<ProductEntity> optionalProduct = repositoryProduct.findByModelName(modelOfProduct);
        if(optionalProduct.isEmpty()) {
            createProductAndVariations(productCreateRequestDTO);
            return;
        }

        ProductEntity thisProductEntity = optionalProduct.get();

        if (!(modelOfProduct.equals(productCreateRequestDTO.getModel()))) {
            createProductAndVariations(productCreateRequestDTO);
            repositoryProduct.delete(thisProductEntity);
            repositoryProduct.flush();
            return;
        }

        thisProductEntity.setDescription(productCreateRequestDTO.getDescription());
        thisProductEntity.setDimensions(productCreateRequestDTO.getDimensions());
        thisProductEntity.setEnabled(productCreateRequestDTO.getEnable());

        Set<String> attributes_X_Product = new HashSet<>();
        List<Attribute_X_ProductEntity> attributes_X_ProductEntityList = thisProductEntity.getAttributeXProductEntities();
        attributes_X_ProductEntityList.clear();
        List<Product_X_CategoryEntity> product_x_categoryEntityList = thisProductEntity.getProductXCategoryEntityList();
        product_x_categoryEntityList.clear();

        repositoryProduct.flush();

        List<VariationEntity> variationEntityList = thisProductEntity.getVariationEntityList();
        List<VariationRequestDTO> variationRequestDTOList = productCreateRequestDTO.getVariations();

        // Obtencion De Los Skus Finales de Variation Request, y Eliminacion de Variaciones Provenientes de la
        // Base de Datos Comparado con dichos Skus Obtenidos
        List<String> skusFromRequest = new ArrayList<>();
        for (VariationRequestDTO variationRequestDTO : variationRequestDTOList) {
            if (variationRequestDTO.getSku() != null) {
                skusFromRequest.add(variationRequestDTO.getSku());
                System.out.print("-----------------------------------" + (variationRequestDTO.getSku()) + "-----------------------------------");
            }
        }
        Iterator<VariationEntity> iterator = variationEntityList.iterator();
        while (iterator.hasNext()) {
            VariationEntity variationEntityFromDB = iterator.next();
            if (!skusFromRequest.contains(variationEntityFromDB.getSku())) {
                System.out.println("-----------------------------------" + variationEntityFromDB.getSku() + "-----------------------------------");
                iterator.remove();
            }
        }

        repositoryProduct.flush();

        for(VariationRequestDTO thisVariationRequestDTO : variationRequestDTOList) {
            VariationEntity existVariation = null;
            for (VariationEntity variationFromDB : variationEntityList) {
                if (variationFromDB.getSku().trim().equals(thisVariationRequestDTO.getSku().trim())) {
                    existVariation = variationFromDB;
                    break;
                }
            }

            if(existVariation == null) {
                VariationEntity thisVariationEntity = new VariationEntity();

                if(repositoryVariation.existsBySku(thisVariationRequestDTO.getSku())) {
                    throw new IllegalArgumentException("SKU Already Exists in Database linked to a another Product");
                }

                thisVariationEntity.setSku(thisVariationRequestDTO.getSku());
                thisVariationEntity.setVariationName(thisVariationRequestDTO.getName());
                thisVariationEntity.setInstationParameters(thisVariationRequestDTO.getInstance_params());
                thisVariationEntity.setModel3dPath(thisVariationRequestDTO.getModel_3d());
                thisVariationEntity.setPrice(thisVariationRequestDTO.getPrice());
                thisVariationEntity.setIsTop(thisVariationRequestDTO.getTop());
                thisVariationEntity.setEnabled(thisVariationRequestDTO.getEnabled());

                thisVariationEntity.setProductEntity(thisProductEntity);

                List<ThumbnailEntity> thumbnailEntityList = new ArrayList<>();
                ThumbnailEntity thumbnailEntity = new ThumbnailEntity();
                thumbnailEntity.setThumbnailPath(thisVariationRequestDTO.getThumbnail());
                thumbnailEntity.setIsTop(true);
                thumbnailEntity.setVariationEntity(thisVariationEntity);
                thumbnailEntityList.add(thumbnailEntity);

                List<String> thumbnailResponseList = thisVariationRequestDTO.getImgs();
                for(String thisThumbnailRequest : thumbnailResponseList) {
                    ThumbnailEntity thisThumbnailEntity = new ThumbnailEntity();
                    thisThumbnailEntity.setThumbnailPath(thisThumbnailRequest);
                    thisThumbnailEntity.setIsTop(false);
                    thisThumbnailEntity.setVariationEntity(thisVariationEntity);
                    thumbnailEntityList.add(thisThumbnailEntity);
                }
                thisVariationEntity.setThumbnailEntities(thumbnailEntityList);

                List<Attribute_X_VariationEntity> attribute_X_variationEntityList = new ArrayList<>();
                List<AttributeSummaryRequestDTO> attributeSummaryRequestDTOList = thisVariationRequestDTO.getAtribs();
                for(AttributeSummaryRequestDTO thisAttributeSummaryRequestDTO : attributeSummaryRequestDTOList) {
                    Optional<AttributeEntity> optionalAttribute = repositoryAttribute.findByAttributeId(thisAttributeSummaryRequestDTO.getId());
                    if(optionalAttribute.isEmpty()) {
                        throw new ResourceNotFoundException("Attribute was not found");
                    }

                    AttributeEntity thisAttributeEntity = optionalAttribute.get();
                    Attribute_X_VariationEntity thisAttribute_X_VariationEntity = new Attribute_X_VariationEntity();
                    thisAttribute_X_VariationEntity.setAttributeValue(thisAttributeSummaryRequestDTO.getValue());
                    thisAttribute_X_VariationEntity.setAttributeEntity(thisAttributeEntity);
                    thisAttribute_X_VariationEntity.setVariationEntity(thisVariationEntity);
                    attribute_X_variationEntityList.add(thisAttribute_X_VariationEntity);

                    if (!attributes_X_Product.contains(thisAttributeEntity.getAttributeId())) {
                        Attribute_X_ProductEntity thisAttribute_x_ProductEntity = new Attribute_X_ProductEntity();
                        thisAttribute_x_ProductEntity.setAttributeEntity(thisAttributeEntity);
                        thisAttribute_x_ProductEntity.setProductEntity(thisProductEntity);
                        attributes_X_ProductEntityList.add(thisAttribute_x_ProductEntity);

                        attributes_X_Product.add(thisAttributeEntity.getAttributeId());
                    }
                }
                thisVariationEntity.setAttributeXVariationEntities(attribute_X_variationEntityList);
                variationEntityList.add(thisVariationEntity);

            } else {
                VariationEntity thisVariationEntity = existVariation;

                thisVariationEntity.setVariationName(thisVariationRequestDTO.getName());
                thisVariationEntity.setInstationParameters(thisVariationRequestDTO.getInstance_params());
                thisVariationEntity.setModel3dPath(thisVariationRequestDTO.getModel_3d());
                thisVariationEntity.setPrice(thisVariationRequestDTO.getPrice());
                thisVariationEntity.setIsTop(thisVariationRequestDTO.getTop());
                thisVariationEntity.setEnabled(thisVariationRequestDTO.getEnabled());

                thisVariationEntity.setProductEntity(thisProductEntity);

                List<ThumbnailEntity> thumbnailEntityList = thisVariationEntity.getThumbnailEntities();
                thumbnailEntityList.clear();
                List<Attribute_X_VariationEntity> attribute_X_variationEntityList = thisVariationEntity.getAttributeXVariationEntities();
                attribute_X_variationEntityList.clear();

                repositoryProduct.flush();

                ThumbnailEntity thumbnailEntity = new ThumbnailEntity();
                thumbnailEntity.setThumbnailPath(thisVariationRequestDTO.getThumbnail());
                thumbnailEntity.setIsTop(true);
                thumbnailEntity.setVariationEntity(thisVariationEntity);
                thumbnailEntityList.add(thumbnailEntity);

                List<String> thumbnailRequestList = thisVariationRequestDTO.getImgs();
                for(String thisThumbnailRequest : thumbnailRequestList) {
                    ThumbnailEntity thisThumbnailEntity = new ThumbnailEntity();
                    thisThumbnailEntity.setThumbnailPath(thisThumbnailRequest);
                    thisThumbnailEntity.setIsTop(false);
                    thisThumbnailEntity.setVariationEntity(thisVariationEntity);
                    thumbnailEntityList.add(thisThumbnailEntity);
                }
                thisVariationEntity.setThumbnailEntities(thumbnailEntityList);

                List<AttributeSummaryRequestDTO> attributeSummaryRequestDTOList = thisVariationRequestDTO.getAtribs();
                for(AttributeSummaryRequestDTO thisAttributeSummaryRequestDTO : attributeSummaryRequestDTOList) {
                    Optional<AttributeEntity> optionalAttribute = repositoryAttribute.findByAttributeId(thisAttributeSummaryRequestDTO.getId());
                    if(optionalAttribute.isEmpty()) {
                        throw new ResourceNotFoundException("Attribute was not found");
                    }

                    AttributeEntity thisAttributeEntity = optionalAttribute.get();
                    Attribute_X_VariationEntity thisAttribute_X_VariationEntity = new Attribute_X_VariationEntity();
                    thisAttribute_X_VariationEntity.setAttributeValue(thisAttributeSummaryRequestDTO.getValue());
                    thisAttribute_X_VariationEntity.setAttributeEntity(thisAttributeEntity);
                    thisAttribute_X_VariationEntity.setVariationEntity(thisVariationEntity);

                    attribute_X_variationEntityList.add(thisAttribute_X_VariationEntity);

                    if (!attributes_X_Product.contains(thisAttributeEntity.getAttributeId())) {
                        Attribute_X_ProductEntity thisAttribute_x_ProductEntity = new Attribute_X_ProductEntity();
                        thisAttribute_x_ProductEntity.setAttributeEntity(thisAttributeEntity);
                        thisAttribute_x_ProductEntity.setProductEntity(thisProductEntity);
                        attributes_X_ProductEntityList.add(thisAttribute_x_ProductEntity);

                        attributes_X_Product.add(thisAttributeEntity.getAttributeId());
                    }
                }
                thisVariationEntity.setAttributeXVariationEntities(attribute_X_variationEntityList);
            }
        }

        List<CategoryRequestDTO> categoryRequestDTOList = productCreateRequestDTO.getCategories();

        for(CategoryRequestDTO thisCategoryResponseDTO : categoryRequestDTOList) {
            Optional<CategoryEntity> optionalCategory = repositoryCategory.findByCategoryId(thisCategoryResponseDTO.getId());
            if(optionalCategory.isEmpty()){
                throw new ResourceNotFoundException("Category not found");
            }
            Product_X_CategoryEntity thisProduct_X_CategoryEntity = new Product_X_CategoryEntity();
            thisProduct_X_CategoryEntity.setCategoryEntity(optionalCategory.get());
            thisProduct_X_CategoryEntity.setProductEntity(thisProductEntity);

            product_x_categoryEntityList.add(thisProduct_X_CategoryEntity);
        }
        repositoryProduct.save(thisProductEntity);
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    public ProductResponseDTO getSpecificProduct(String modelOfProduct, boolean simpleVariation) {
        Optional<ProductEntity> optionalProduct = repositoryProduct.findByModelName(modelOfProduct);
        if (optionalProduct.isEmpty()) {
            throw new ResourceNotFoundException("Product was not Found");
        }

        ProductEntity product  = optionalProduct.get();
        ProductResponseDTO productResponseDTO = new ProductResponseDTO();
        //
        productResponseDTO.setModel(product.getModelName());
        //
        productResponseDTO.setDescription(product.getDescription());
        //
        productResponseDTO.setEnable(product.getEnabled());
        //
        productResponseDTO.setDimensions(product.getDimensions());
        //
        List<VariationResponseDTO> variationResponseDTOList = getVariationResponseDTOS(product, simpleVariation);
        productResponseDTO.setVariations(variationResponseDTOList);
        //
        List<CategoryResponseDTO> categoryResponseDTOList = getCategoryResponseDTOS(product);
        productResponseDTO.setCategories(categoryResponseDTOList);

        return productResponseDTO;
    }

    private List<CategoryResponseDTO> getCategoryResponseDTOS(ProductEntity product) {
        List<Product_X_CategoryEntity> productXCategoryEntityList = product.getProductXCategoryEntityList();
        List<CategoryResponseDTO> categoryResponseDTOList = new ArrayList<>();

        for (Product_X_CategoryEntity thisProduct_X_Category : productXCategoryEntityList) {
            CategoryEntity categoryEntity = thisProduct_X_Category.getCategoryEntity();

            CategoryResponseDTO categoryResponseDTO = new CategoryResponseDTO();

            categoryResponseDTO.setId(categoryEntity.getCategoryId());
            categoryResponseDTO.setName(categoryEntity.getCategoryName());
            categoryResponseDTOList.add(categoryResponseDTO);
        }

        if(categoryResponseDTOList.isEmpty()) {
            throw new NotExistentResourceException("Does not exist Categories for Product");
        }

        return categoryResponseDTOList;
    }

    private List<AttributeSummaryResponseDTO> getAttributeSummaryDTOS(VariationEntity thisVariationEntity) {
        List<Attribute_X_VariationEntity> attribute_X_VariationEntityList = thisVariationEntity.getAttributeXVariationEntities();
        List<AttributeSummaryResponseDTO> attributeSummaryResponseDTOList = new ArrayList<>();

        for (Attribute_X_VariationEntity thisAttribute_X_VariationEntity : attribute_X_VariationEntityList) {
            AttributeEntity thisAttributeEntity = thisAttribute_X_VariationEntity.getAttributeEntity();

            AttributeSummaryResponseDTO attributeSummaryResponseDTO = new AttributeSummaryResponseDTO();

            attributeSummaryResponseDTO.setId(thisAttributeEntity.getAttributeId());
            attributeSummaryResponseDTO.setValue(thisAttribute_X_VariationEntity.getAttributeValue());

            attributeSummaryResponseDTOList.add(attributeSummaryResponseDTO);
        }
        return attributeSummaryResponseDTOList;
    }

    private List<VariationResponseDTO> getVariationResponseDTOS(ProductEntity thisProductEntity, boolean simpleVariation) {
        List<VariationResponseDTO> variationResponseDTOList = new ArrayList<>();
        List<VariationEntity> variationEntityList = thisProductEntity.getVariationEntityList();
        if (!simpleVariation) {
            for (VariationEntity thisVariationEntity : variationEntityList) {
                VariationResponseDTO thisVariationResponseDTO = new VariationResponseDTO();
                //
                thisVariationResponseDTO.setSku(thisVariationEntity.getSku());
                //
                thisVariationResponseDTO.setName(thisVariationEntity.getVariationName());
                //
                List<ThumbnailEntity> thumbnailEntityList = thisVariationEntity.getThumbnailEntities();
                List<String> thumbnailResponseDTOList = new ArrayList<>();
                for(ThumbnailEntity thisThumbnailEntity : thumbnailEntityList) {
                    if (thisThumbnailEntity.getIsTop()) {
                        thisVariationResponseDTO.setThumbnail(thisThumbnailEntity.getThumbnailPath());
                    } else {
                        thumbnailResponseDTOList.add(thisThumbnailEntity.getThumbnailPath());
                    }
                }
                thisVariationResponseDTO.setImgs(thumbnailResponseDTOList);
                //
                thisVariationResponseDTO.setInstance_params(thisVariationEntity.getInstationParameters());
                //
                thisVariationResponseDTO.setModel_3d(thisVariationEntity.getModel3dPath());
                //
                thisVariationResponseDTO.setPrice(thisVariationEntity.getPrice());
                //
                thisVariationResponseDTO.setTop(thisVariationEntity.getIsTop());
                //
                thisVariationResponseDTO.setEnabled(thisVariationEntity.getEnabled());
                //
                List<AttributeSummaryResponseDTO> attributeSummaryResponseDTOList = getAttributeSummaryDTOS(thisVariationEntity);
                thisVariationResponseDTO.setAtribs(attributeSummaryResponseDTOList);

                variationResponseDTOList.add(thisVariationResponseDTO);
            }

        } else {

            for(VariationEntity thisVariationEntity : variationEntityList) {
                VariationResponseDTO thisVariationResponseDTO = new VariationResponseDTO();
                thisVariationResponseDTO.setSku(thisVariationEntity.getSku());
                thisVariationResponseDTO.setName(thisVariationEntity.getVariationName());

                variationResponseDTOList.add(thisVariationResponseDTO);
            }
        }
        if(variationResponseDTOList.isEmpty()) {
            throw new NotExistentResourceException("Does not exist Variations for Product");
        }
        return variationResponseDTOList;
    }
}
