package project.backendmueblar.modules.interactions.services;


import jakarta.persistence.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.InternalServerException;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.catalog.dtos.ProductSummaryDTO;
import project.backendmueblar.modules.catalog.dtos.response.ProductResponseDTO;
import project.backendmueblar.modules.catalog.dtos.response.VariationSummaryDTO;
import project.backendmueblar.modules.catalog.entities.ProductEntity;
import project.backendmueblar.modules.catalog.entities.ThumbnailEntity;
import project.backendmueblar.modules.catalog.entities.VariationEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryProduct;
import project.backendmueblar.modules.catalog.services.CatalogService;
import project.backendmueblar.modules.interactions.dtos.request.CollectionCreateRequestDTO;
import project.backendmueblar.modules.interactions.dtos.response.CollectionResponseDTO;
import project.backendmueblar.modules.interactions.entities.CollectionEntity;
import project.backendmueblar.modules.interactions.entities.Collection_X_ProductEntity;
import project.backendmueblar.modules.interactions.repositories.RepositoryCollection;
import project.backendmueblar.modules.interactions.repositories.RepositoryCollection_X_Product;
import project.backendmueblar.modules.logEntry.services.LogService;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CollectionService {
    private final RepositoryCollection collectionRepository;
    private final RepositoryProduct repositoryProduct;
    private final RepositoryCollection_X_Product repositoryCollectionXProduct;

    private final CatalogService catalogService;

    private final JwtService jwtService;
    private final LogService logService;
    private final ObjectMapper objectMapper;
    private final RepositoryUser userRepository;

    // Metodo de Servicio PRIVATE : Extraccion del Nombre de la Tabla en la Base de Datos asociado a una Entidad Cualquiera //
    private String tableNameFromEntity(Object entity){
        Class<?> entityClass = entity.getClass();
        Table tableAnnotation = entityClass.getAnnotation(Table.class);

        if (tableAnnotation != null && !tableAnnotation.name().isEmpty()) {
            return tableAnnotation.name();
        }
        return entityClass.getSimpleName().toLowerCase();
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Servicio PRIVATE : Comprobacion de Existencia de Usuario mediante Token JWT brindado //
    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found");
        }
        return optionalUser;
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Servicio : Creacion de Coleccion Especifica relacionado a un Usuario //
    public void createCollection(CollectionCreateRequestDTO collectionCreateRequestDTO, String authHeader) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByTitleAndUserEntity(collectionCreateRequestDTO.getTitle(), thisUserEntity);
        if (optionalCollection.isPresent()) {
            throw new ResourceAlreadyExistsException("The Collection already exists");
        }

        CollectionEntity collectionEntity = new CollectionEntity();
        collectionEntity.setTitle(collectionCreateRequestDTO.getTitle());
        collectionEntity.setErasable(true);
        collectionEntity.setUserEntity(thisUserEntity);

        collectionRepository.save(collectionEntity);
        logService.logEntryDataBase(tableNameFromEntity(collectionEntity), thisUserEntity.getUserId(), objectMapper.convertValue(collectionEntity, new TypeReference<Map<String, Object>>() {}), null, 1);

    }

    // --------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Modificacion de Coleccion Especifica relacionado a un Usuario //
    public void updateCollectionName(Long collectionId, CollectionCreateRequestDTO collectionUpdateRequestDTO, String authHeader) {
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByCollectionId(collectionId);
        if (optionalCollection.isEmpty()) {
            throw new ResourceNotFoundException("Collection not found");
        }

        CollectionEntity thisCollectionEntity = optionalCollection.get();
        Map<String, Object> oldValueMap = objectMapper.convertValue(thisCollectionEntity, new TypeReference<Map<String, Object>>() {});

        if(!(thisCollectionEntity.getUserEntity().getUserId().equals(thisUserEntity.getUserId()))) {
            throw new UserIDNotMatchException("The Collection does not belong to this user");
        }

        thisCollectionEntity.setTitle(collectionUpdateRequestDTO.getTitle());
        collectionRepository.save(thisCollectionEntity);
        logService.logEntryDataBase(tableNameFromEntity(thisCollectionEntity), thisUserEntity.getUserId(), objectMapper.convertValue(thisCollectionEntity, new TypeReference<Map<String, Object>>() {}), oldValueMap, 2);
    }

    // --------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Eliminacion de Coleccion Especifica relacionado a un Usuario //
    public void deleteCollectionAndLogs(Long collectionId, String authHeader){
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByCollectionId(collectionId);
        if (optionalCollection.isEmpty()) {
            throw new ResourceNotFoundException("Collection not found");
        }

        CollectionEntity thisCollectionEntity = optionalCollection.get();

        if(!(thisCollectionEntity.getUserEntity().getUserId().equals(thisUserEntity.getUserId()))) {
            throw new UserIDNotMatchException("The Collection does not belong to this user");
        }

        collectionRepository.delete(thisCollectionEntity);
        logService.logEntryDataBase(tableNameFromEntity(thisCollectionEntity), thisUserEntity.getUserId(), null, objectMapper.convertValue(thisCollectionEntity, new TypeReference<Map<String, Object>>() {}), 3);
    }

    // --------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Agregar Producto Especifico a Coleccion de Usuario //
    public void addProductToCollection(Long collectionId, String authHeader, ProductSummaryDTO productSummaryDTO) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByCollectionId(collectionId);
        if (optionalCollection.isEmpty()) {
            throw new ResourceNotFoundException("Collection not found");
        }

        CollectionEntity thisCollectionEntity = optionalCollection.get();

        if(!(thisCollectionEntity.getUserEntity().getUserId().equals(thisUserEntity.getUserId()))) {
            throw new UserIDNotMatchException("The Collection does not belong to this user");
        }

        Optional<ProductEntity> optionalProduct = repositoryProduct.findByModelName(productSummaryDTO.getModel());
        if (optionalProduct.isEmpty()) {
            throw new ResourceNotFoundException("Product not found");
        }

        ProductEntity thisProduct = optionalProduct.get();

        Optional<Collection_X_ProductEntity> optionalCollectionXProductEntity = repositoryCollectionXProduct.findByProductEntityAndCollectionEntity(thisProduct, thisCollectionEntity);
        if (optionalCollectionXProductEntity.isPresent()) {
            throw new ResourceAlreadyExistsException("The Product already exists in the Collection");
        }

        Collection_X_ProductEntity collection_X_ProductEntity = new Collection_X_ProductEntity();
        collection_X_ProductEntity.setCollectionEntity(thisCollectionEntity);
        collection_X_ProductEntity.setProductEntity(thisProduct);
        repositoryCollectionXProduct.save(collection_X_ProductEntity);
        logService.logEntryDataBase(tableNameFromEntity(collection_X_ProductEntity), thisUserEntity.getUserId(), objectMapper.convertValue(collection_X_ProductEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
    }

    // --------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Eliminar Producto Especifico de Coleccion de Usuario //
    public void deleteProductFromCollection(String authHeader, Long collectionId, String modelOfProduct){
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByCollectionId(collectionId);
        if (optionalCollection.isEmpty()) {
            throw new ResourceNotFoundException("Collection not found");
        }

        CollectionEntity thisCollectionEntity = optionalCollection.get();

        if(!(thisCollectionEntity.getUserEntity().getUserId().equals(thisUserEntity.getUserId()))) {
            throw new UserIDNotMatchException("The Collection does not belong to this user");
        }

        Optional<ProductEntity> optionalProduct = repositoryProduct.findByModelName(modelOfProduct);
        if (optionalProduct.isEmpty()) {
            throw new ResourceNotFoundException("Product not found");
        }

        ProductEntity thisProduct = optionalProduct.get();

        Optional<Collection_X_ProductEntity> optionalCollectionXProductEntity = repositoryCollectionXProduct.findByProductEntityAndCollectionEntity(thisProduct, thisCollectionEntity);
        if (optionalCollectionXProductEntity.isEmpty()) {
            throw new ResourceNotFoundException("The Product is not related to the Collection");
        }

        Collection_X_ProductEntity thisCollection_X_ProductEntity = optionalCollectionXProductEntity.get();
        repositoryCollectionXProduct.delete(thisCollection_X_ProductEntity);
        logService.logEntryDataBase(tableNameFromEntity(thisCollection_X_ProductEntity), thisUserEntity.getUserId(), null, objectMapper.convertValue(thisCollection_X_ProductEntity, new TypeReference<Map<String, Object>>() {}), 3);
    }

    // --------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Obtener Todos los Productos Relacionados a Coleccion Especifica de Usuario //
    public List<ProductResponseDTO> getProductsFromCollectionFilter(String authHeader, Long collectionId, Integer limit, Integer page) {
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByCollectionId(collectionId);
        if (optionalCollection.isEmpty()) {
            throw new ResourceNotFoundException("Collection not found");
        }

        CollectionEntity thisCollectionEntity = optionalCollection.get();

        if(!(thisCollectionEntity.getUserEntity().getUserId().equals(thisUserEntity.getUserId()))) {
            throw new UserIDNotMatchException("The Collection does not belong to this user");
        }

        if(limit == 0) {
            throw new InternalServerException("Cannot throw zero Products");
        }

        Pageable pageable = PageRequest.of(page, limit);

        List<ProductEntity> productEntityList = repositoryProduct.findAll(pageable).getContent();
        if(productEntityList.isEmpty()) {
            throw new ResourceNotFoundException("Not Exists Any Product");
        }

        List<ProductResponseDTO> productResponseDTOList = new ArrayList<>();

        for (ProductEntity productEntity : productEntityList) {
            ProductResponseDTO thisProductResponseDTO = catalogService.getSpecificProduct(productEntity.getModelName(), true);
            productResponseDTOList.add(thisProductResponseDTO);
        }

        return productResponseDTOList;
    }

    // Metodo de Servicio : Obtencion de todos las Colecciones de Usuario mediante Filtro //
    public List<CollectionResponseDTO> getCollectionsFromUserFilter(String authHeader, Integer limit, Integer page, String search) {
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Pageable pageable = PageRequest.of(page, limit);

        List<CollectionEntity> collectionEntityList;
        List<CollectionResponseDTO> collectionResponseDTOList = new ArrayList<>();

        if(search == null || search.trim().isEmpty()) {
            collectionEntityList = collectionRepository.findAllByUserEntity(thisUserEntity, pageable);

            convertCollectionEntityToResponseDTO(collectionEntityList, collectionResponseDTOList);
        } else {
            collectionEntityList = collectionRepository.findByUserEntityAndTitleContainingIgnoreCase(thisUserEntity, search, pageable);

            convertCollectionEntityToResponseDTO(collectionEntityList, collectionResponseDTOList);
        }
        return collectionResponseDTOList;
    }

    // Metodo de Servicio : Conversion de Entidad "Coleccion" a una DTO de Respuesta para la API //
    private void convertCollectionEntityToResponseDTO(List<CollectionEntity> collectionEntityList, List<CollectionResponseDTO> collectionResponseDTOList) {
        for(CollectionEntity thisCollectionEntity : collectionEntityList) {
            CollectionResponseDTO collectionResponseDTO = new  CollectionResponseDTO();
            collectionResponseDTO.setId(thisCollectionEntity.getCollectionId());
            collectionResponseDTO.setTitle(thisCollectionEntity.getTitle());

            List<Collection_X_ProductEntity> collectionXProductEntityList = thisCollectionEntity.getCollectionXProductEntityList();
            List<ProductSummaryDTO> productSummaryDTOList = new ArrayList<>();
            for(Collection_X_ProductEntity thisCollection_X_ProductEntity : collectionXProductEntityList) {
                ProductEntity thisProductEntity = thisCollection_X_ProductEntity.getProductEntity();

                ProductSummaryDTO thisProductSummaryDTO = new ProductSummaryDTO();
                thisProductSummaryDTO.setModel(thisProductEntity.getModelName());

                List<VariationEntity> variationEntityList = thisProductEntity.getVariationEntityList();
                List<VariationSummaryDTO> variationSummaryDTOList = new ArrayList<>();
                for(VariationEntity thisVariationEntity : variationEntityList) {
                    VariationSummaryDTO thisVariationSummaryDTO = new VariationSummaryDTO();
                    thisVariationSummaryDTO.setName(thisVariationEntity.getVariationName());

                    List<ThumbnailEntity> thumbnailEntityList = thisVariationEntity.getThumbnailEntities();
                    for(ThumbnailEntity thisThumbnailEntity : thumbnailEntityList) {
                        if(thisThumbnailEntity.getIsTop() == true) {
                            thisVariationSummaryDTO.setThumbnail(thisThumbnailEntity.getThumbnailPath());
                        }
                    }

                    thisVariationSummaryDTO.setSku(thisVariationEntity.getSku());
                    thisVariationSummaryDTO.setPrice(thisVariationEntity.getPrice());
                    variationSummaryDTOList.add(thisVariationSummaryDTO);
                }

                thisProductSummaryDTO.setVariations(variationSummaryDTOList);
                productSummaryDTOList.add(thisProductSummaryDTO);
            }
            collectionResponseDTO.setProducts(productSummaryDTOList);
            collectionResponseDTOList.add(collectionResponseDTO);
        }
    }

}
